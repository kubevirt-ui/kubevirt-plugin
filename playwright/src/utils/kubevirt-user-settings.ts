import { clusterKubernetesJson } from '@/utils/cluster-kubernetes-api';
import {
  type ConsoleProxyRequestOptions,
  getConsoleKubernetesProxyHeaders,
} from '@/utils/console-kubernetes-proxy';
import type { APIRequestContext } from '@playwright/test';

const KUBEVIRT_USER_SETTINGS_NAMESPACE = 'default';
const KUBEVIRT_USER_SETTINGS_CONFIG_MAP = 'kubevirt-user-settings';
const USER_SETTINGS_ROLE_NAME = 'kubevirt-user-settings-reader';
const USER_SETTINGS_ROLE_BINDING_NAME = 'kubevirt-user-settings-reader-binding';

async function createNamespacedResource(
  apiPath: string,
  body: Record<string, unknown>,
  kubeconfigPath?: string,
): Promise<void> {
  const response = await clusterKubernetesJson('POST', apiPath, body, undefined, kubeconfigPath);
  if (!response.ok && response.status !== 409) {
    throw new Error(
      `Create ${apiPath} failed (${response.status}): ${response.text.slice(0, 500)}`,
    );
  }
}

async function upsertNamespacedRole(
  role: Record<string, unknown>,
  kubeconfigPath?: string,
): Promise<void> {
  const name = (role.metadata as { name: string }).name;
  const namespace = (role.metadata as { namespace: string }).namespace;
  const path = `/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles/${name}`;
  const response = await clusterKubernetesJson('PUT', path, role, undefined, kubeconfigPath);
  if (!response.ok) {
    throw new Error(
      `Upsert Role ${name} failed (${response.status}): ${response.text.slice(0, 500)}`,
    );
  }
}

/** Role + RoleBinding for `default/kubevirt-user-settings` (InstanceTypes loader + column prefs PATCH). */
export async function ensureKubevirtUserSettingsReaderRbac(
  options: { kubeconfigPath?: string } = {},
): Promise<void> {
  const kubeconfigPath = options.kubeconfigPath;
  const role = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'Role',
    metadata: { name: USER_SETTINGS_ROLE_NAME, namespace: KUBEVIRT_USER_SETTINGS_NAMESPACE },
    rules: [
      {
        apiGroups: [''],
        resourceNames: [KUBEVIRT_USER_SETTINGS_CONFIG_MAP],
        resources: ['configmaps'],
        verbs: ['get', 'list', 'watch', 'update', 'patch'],
      },
    ],
  };
  const roleBinding = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: USER_SETTINGS_ROLE_BINDING_NAME,
      namespace: KUBEVIRT_USER_SETTINGS_NAMESPACE,
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'Role',
      name: USER_SETTINGS_ROLE_NAME,
    },
    subjects: [
      {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Group',
        name: 'system:authenticated',
      },
    ],
  };
  await upsertNamespacedRole(role, kubeconfigPath);
  await createNamespacedResource(
    `/apis/rbac.authorization.k8s.io/v1/namespaces/${KUBEVIRT_USER_SETTINGS_NAMESPACE}/rolebindings`,
    roleBinding,
    kubeconfigPath,
  );
}

function kubevirtSettingsWithWelcomeHidden(existingRaw?: string): string {
  const existing = existingRaw
    ? (JSON.parse(existingRaw) as Record<string, unknown>)
    : { cards: {}, columns: {}, quickStart: {}, ssh: {} };
  const quickStart =
    existing.quickStart && typeof existing.quickStart === 'object'
      ? { ...(existing.quickStart as Record<string, unknown>) }
      : {};
  return JSON.stringify({
    ...existing,
    quickStart: { ...quickStart, dontShowWelcomeModal: true },
  });
}

/** Matches `useKubevirtUserSettings` ConfigMap data key derivation. */
export async function kubevirtUserSettingsDataKeyFromConsoleSession(
  request: APIRequestContext,
  consoleOrigin: string,
  proxyOptions: ConsoleProxyRequestOptions = {},
): Promise<string> {
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers = getConsoleKubernetesProxyHeaders(origin, proxyOptions);
  const userRes = await request.get(`${origin}/api/kubernetes/apis/user.openshift.io/v1/users/~`, {
    headers,
  });
  if (!userRes.ok()) {
    const body = await userRes.text();
    throw new Error(`fetch openshift user ~ failed (${userRes.status()}): ${body.slice(0, 300)}`);
  }
  const user = (await userRes.json()) as {
    metadata?: { name?: string; uid?: string };
  };
  return openshiftUserKubevirtSettingsDataKey(user?.metadata?.name, user?.metadata?.uid);
}

export function openshiftUserKubevirtSettingsDataKey(name?: string, uid?: string): string {
  const sanitizedName = name?.replace(/[^-._a-zA-Z0-9]+/g, '-');
  const key = uid || sanitizedName;
  if (!key) {
    throw new Error('OpenShift user missing metadata.uid and metadata.name');
  }
  return key;
}

export function buildKubevirtUserSettingsHideWelcomeJson(existingRaw?: string): string {
  return kubevirtSettingsWithWelcomeHidden(existingRaw);
}

/**
 * JSON-patch `kubevirt-user-settings` so virtualization welcome modal stays hidden.
 */
export async function patchKubevirtUserSettingsHideWelcomeViaConsoleProxy(
  request: APIRequestContext,
  consoleOrigin: string,
  proxyOptions: ConsoleProxyRequestOptions = {},
): Promise<void> {
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers = getConsoleKubernetesProxyHeaders(origin, proxyOptions);
  const dataKey = await kubevirtUserSettingsDataKeyFromConsoleSession(
    request,
    origin,
    proxyOptions,
  );
  const cmPath = `/api/kubernetes/api/v1/namespaces/${KUBEVIRT_USER_SETTINGS_NAMESPACE}/configmaps/${KUBEVIRT_USER_SETTINGS_CONFIG_MAP}`;
  const cmUrl = `${origin}${cmPath}`;

  const getRes = await request.get(cmUrl, { headers });
  if (getRes.status() === 404) {
    const value = kubevirtSettingsWithWelcomeHidden();
    const create = await request.post(
      `${origin}/api/kubernetes/api/v1/namespaces/${KUBEVIRT_USER_SETTINGS_NAMESPACE}/configmaps`,
      {
        data: {
          apiVersion: 'v1',
          data: { [dataKey]: value },
          kind: 'ConfigMap',
          metadata: {
            name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP,
            namespace: KUBEVIRT_USER_SETTINGS_NAMESPACE,
          },
        },
        headers: { ...headers, 'Content-Type': 'application/json' },
      },
    );
    if (create.ok() || create.status() === 409) {
      return;
    }
    const body = await create.text();
    throw new Error(
      `create kubevirt-user-settings failed (${create.status()}): ${body.slice(0, 500)}`,
    );
  }
  if (!getRes.ok()) {
    const body = await getRes.text();
    throw new Error(
      `get kubevirt-user-settings failed (${getRes.status()}): ${body.slice(0, 500)}`,
    );
  }

  const cm = (await getRes.json()) as { data?: Record<string, string> };
  const value = kubevirtSettingsWithWelcomeHidden(cm.data?.[dataKey]);
  const op = cm.data?.[dataKey] ? 'replace' : 'add';
  const patch = await request.patch(cmUrl, {
    data: [{ op, path: `/data/${dataKey}`, value }],
    headers: { ...headers, 'Content-Type': 'application/json-patch+json' },
  });
  if (patch.ok()) {
    return;
  }
  const body = await patch.text();
  throw new Error(
    `patch kubevirt-user-settings (${dataKey}) failed (${patch.status()}): ${body.slice(0, 500)}`,
  );
}
