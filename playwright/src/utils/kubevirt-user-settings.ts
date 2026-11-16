import { clusterKubernetesJson } from '@/utils/cluster-kubernetes-api';
import {
  type ConsoleProxyRequestOptions,
  getConsoleKubernetesProxyHeaders,
} from '@/utils/console-kubernetes-proxy';
import { EnvVariables } from '@/utils/env-variables';
import type { APIRequestContext } from '@playwright/test';

const KUBEVIRT_USER_SETTINGS_CONFIG_MAP = 'kubevirt-user-settings';
const USER_SETTINGS_ROLE_NAME = 'kubevirt-user-settings-reader';
const USER_SETTINGS_ROLE_BINDING_NAME = 'kubevirt-user-settings-reader-binding';

/** Kubeadmin global-setup JSON for `/data/kube-admin` on `kubevirt-user-settings`. */
export const KUBEADMIN_KUBEVIRT_WELCOME_HIDDEN_JSON =
  '{"quickStart":{"dontShowWelcomeModal":true},"onboardingPopoversHidden":{"catalog":true,"createProject":true}}';

type JsonPatchOp = {
  op: 'add' | 'replace';
  path: string;
  value: Record<string, unknown> | string;
};

function kubevirtUserSettingsNamespace(cnvNamespace?: string): string {
  return cnvNamespace ?? EnvVariables.cnvNamespace;
}

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

/** Role + RoleBinding so non-priv users can GET `openshift-cnv/kubevirt-user-settings`. */
export async function ensureKubevirtUserSettingsReaderRbac(
  options: { cnvNamespace?: string; kubeconfigPath?: string } = {},
): Promise<void> {
  const namespace = kubevirtUserSettingsNamespace(options.cnvNamespace);
  const kubeconfigPath = options.kubeconfigPath;
  const role = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'Role',
    metadata: { name: USER_SETTINGS_ROLE_NAME, namespace },
    rules: [
      {
        apiGroups: [''],
        resourceNames: [KUBEVIRT_USER_SETTINGS_CONFIG_MAP],
        resources: ['configmaps'],
        verbs: ['get', 'list', 'watch'],
      },
    ],
  };
  const roleBinding = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: {
      name: USER_SETTINGS_ROLE_BINDING_NAME,
      namespace,
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
  await createNamespacedResource(
    `/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles`,
    role,
    kubeconfigPath,
  );
  await createNamespacedResource(
    `/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/rolebindings`,
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
  const onboardingPopoversHidden =
    existing.onboardingPopoversHidden && typeof existing.onboardingPopoversHidden === 'object'
      ? { ...(existing.onboardingPopoversHidden as Record<string, unknown>) }
      : {};
  const navigation =
    existing.navigation && typeof existing.navigation === 'object'
      ? { ...(existing.navigation as Record<string, unknown>) }
      : {};
  return JSON.stringify({
    ...existing,
    guidedTour: false,
    navigation: { ...navigation, autoHideNav: false },
    onboardingPopoversHidden: {
      ...onboardingPopoversHidden,
      catalog: true,
      createProject: true,
      navCollapse: true,
      vmsTab: true,
    },
    quickStart: { ...quickStart, dontShowWelcomeModal: true, activeQuickStartID: '' },
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

/** JSON Patch ops for `/api/kubernetes/.../configmaps/kubevirt-user-settings` (see product `patchUserConfigMap`). */
export function buildKubevirtUserSettingsWelcomeJsonPatch(
  cm: { data?: Record<string, string> } | undefined,
  dataKey: string,
): JsonPatchOp[] {
  const welcomeValue =
    dataKey === 'kube-admin'
      ? KUBEADMIN_KUBEVIRT_WELCOME_HIDDEN_JSON
      : buildKubevirtUserSettingsHideWelcomeJson(cm?.data?.[dataKey]);

  if (!cm?.data) {
    return [
      { op: 'add', path: '/data', value: {} },
      { op: 'add', path: `/data/${dataKey}`, value: welcomeValue },
    ];
  }
  if (cm.data[dataKey]) {
    return [{ op: 'replace', path: `/data/${dataKey}`, value: welcomeValue }];
  }
  return [{ op: 'add', path: `/data/${dataKey}`, value: welcomeValue }];
}

async function applyKubevirtUserSettingsWelcomePatchViaConsoleProxy(
  request: APIRequestContext,
  consoleOrigin: string,
  dataKey: string,
  proxyOptions: ConsoleProxyRequestOptions & { cnvNamespace?: string },
): Promise<void> {
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers = getConsoleKubernetesProxyHeaders(origin, proxyOptions);
  const namespace = kubevirtUserSettingsNamespace(proxyOptions.cnvNamespace);
  const cmPath = `/api/kubernetes/api/v1/namespaces/${namespace}/configmaps/${KUBEVIRT_USER_SETTINGS_CONFIG_MAP}`;
  const cmUrl = `${origin}${cmPath}`;

  const getRes = await request.get(cmUrl, { headers });
  if (getRes.status() === 404) {
    const patchOps = buildKubevirtUserSettingsWelcomeJsonPatch(undefined, dataKey);
    const data = patchOps.reduce<Record<string, string>>((acc, op) => {
      if (op.path.startsWith('/data/') && typeof op.value === 'string') {
        acc[op.path.slice('/data/'.length)] = op.value;
      }
      return acc;
    }, {});
    const create = await request.post(
      `${origin}/api/kubernetes/api/v1/namespaces/${namespace}/configmaps`,
      {
        data: {
          apiVersion: 'v1',
          data,
          kind: 'ConfigMap',
          metadata: {
            name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP,
            namespace,
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
  const patchOps = buildKubevirtUserSettingsWelcomeJsonPatch(cm, dataKey);
  const patch = await request.patch(cmUrl, {
    data: patchOps,
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

/**
 * JSON-patch `kubevirt-user-settings` in the CNV namespace so the virtualization welcome modal stays hidden.
 * Patches `kube-admin` (global setup) and the logged-in user's data key (matches `useKubevirtUserSettings`).
 */
export async function patchKubevirtUserSettingsHideWelcomeViaConsoleProxy(
  request: APIRequestContext,
  consoleOrigin: string,
  proxyOptions: ConsoleProxyRequestOptions & { cnvNamespace?: string } = {},
): Promise<void> {
  const sessionKey = await kubevirtUserSettingsDataKeyFromConsoleSession(
    request,
    consoleOrigin,
    proxyOptions,
  );
  const dataKeys = [...new Set(['kube-admin', sessionKey])];
  for (const dataKey of dataKeys) {
    await applyKubevirtUserSettingsWelcomePatchViaConsoleProxy(
      request,
      consoleOrigin,
      dataKey,
      proxyOptions,
    );
  }
}
