import { clusterKubernetesJson } from '@/utils/cluster-kubernetes-api';
import { canRunOc } from '@/utils/cluster-oc';
import {
  type ConsoleProxyRequestOptions,
  getConsoleKubernetesProxyHeaders,
} from '@/utils/console-kubernetes-proxy';
import type { APIRequestContext } from '@playwright/test';

export const KUBEVIRT_UI_FEATURES_CONFIG_MAP = 'kubevirt-ui-features';

/** Feature key for InstanceTypes developer preview (`useFeatures` / Virtualization settings). */
export const INSTANCE_TYPE_ENABLED = 'instanceTypesEnabled';

/** HCO `spec.featureGates.autoResourceLimits` (Cluster → Resource management). */
export const AUTO_RESOURCE_LIMITS_FEATURE_GATE = 'autoResourceLimits';

export const KUBEVIRT_HYPERCONVERGED_NAME = 'kubevirt-hyperconverged';

/** Namespace for `useFeatures` ConfigMap (`kubevirt-ui-features` in plugin code). */
export const KUBEVIRT_UI_FEATURES_NAMESPACE = 'default';

/** Matches plugin `useFeatures` RBAC so non-priv users can read flags via the console proxy. */
const FEATURES_ROLE_NAME = 'kubevirt-ui-features-reader';
const FEATURES_ROLE_BINDING_NAME = 'kubevirt-ui-features-reader-binding';

function featuresNamespace(options: { cnvNamespace?: string }): string {
  return options.cnvNamespace ?? KUBEVIRT_UI_FEATURES_NAMESPACE;
}

function configMapPath(namespace: string): string {
  return `/api/v1/namespaces/${namespace}/configmaps/${KUBEVIRT_UI_FEATURES_CONFIG_MAP}`;
}

async function createKubevirtUiFeaturesConfigMap(
  namespace: string,
  data: Record<string, string>,
): Promise<void> {
  const response = await clusterKubernetesJson(
    'POST',
    `/api/v1/namespaces/${namespace}/configmaps`,
    {
      apiVersion: 'v1',
      data,
      kind: 'ConfigMap',
      metadata: { name: KUBEVIRT_UI_FEATURES_CONFIG_MAP, namespace },
    },
  );
  if (!response.ok && response.status !== 409) {
    throw new Error(
      `Create ConfigMap ${namespace}/${KUBEVIRT_UI_FEATURES_CONFIG_MAP} failed (${
        response.status
      }): ${response.text.slice(0, 500)}`,
    );
  }
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

/**
 * Role + RoleBinding for `system:authenticated` to get/watch `kubevirt-ui-features`
 * (same as `createFeaturesConfigMap` in the plugin).
 */
export async function ensureKubevirtUiFeaturesReaderRbac(
  options: { cnvNamespace?: string; kubeconfigPath?: string } = {},
): Promise<void> {
  const namespace = featuresNamespace(options);
  const kubeconfigPath = options.kubeconfigPath;
  const role = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'Role',
    metadata: { name: FEATURES_ROLE_NAME, namespace },
    rules: [
      {
        apiGroups: [''],
        resourceNames: [KUBEVIRT_UI_FEATURES_CONFIG_MAP],
        resources: ['configmaps'],
        verbs: ['get', 'list', 'watch'],
      },
    ],
  };
  const roleBinding = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'RoleBinding',
    metadata: { name: FEATURES_ROLE_BINDING_NAME, namespace },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'Role',
      name: FEATURES_ROLE_NAME,
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

async function mergePatchKubevirtUiFeaturesData(
  namespace: string,
  data: Record<string, string>,
): Promise<void> {
  const response = await clusterKubernetesJson(
    'PATCH',
    configMapPath(namespace),
    { data },
    { 'Content-Type': 'application/merge-patch+json' },
  );
  if (response.ok) {
    return;
  }
  if (response.status === 404) {
    await createKubevirtUiFeaturesConfigMap(namespace, data);
    return;
  }
  throw new Error(
    `Patch ConfigMap ${namespace}/${KUBEVIRT_UI_FEATURES_CONFIG_MAP} failed (${
      response.status
    }): ${response.text.slice(0, 500)}`,
  );
}

export async function ensureKubevirtUiFeaturesConfigMap(
  options: { cnvNamespace?: string } = {},
): Promise<void> {
  const namespace = featuresNamespace(options);
  const get = await clusterKubernetesJson('GET', configMapPath(namespace));
  if (get.ok) {
    return;
  }
  if (get.status === 404) {
    await createKubevirtUiFeaturesConfigMap(namespace, { [INSTANCE_TYPE_ENABLED]: 'true' });
    return;
  }
  throw new Error(
    `GET ConfigMap ${namespace}/${KUBEVIRT_UI_FEATURES_CONFIG_MAP} failed (${
      get.status
    }): ${get.text.slice(0, 500)}`,
  );
}

export async function patchKubevirtUiFeature(
  featureName: string,
  value: string,
  options: { cnvNamespace?: string } = {},
): Promise<void> {
  const namespace = featuresNamespace(options);
  await ensureKubevirtUiFeaturesConfigMap({ cnvNamespace: namespace });
  await ensureKubevirtUiFeaturesReaderRbac({ cnvNamespace: namespace });
  await mergePatchKubevirtUiFeaturesData(namespace, { [featureName]: value });
}

/** Cluster API (kubeconfig). Used only when console proxy cannot patch (e.g. non-priv 403). */
export async function enableInstanceTypesDeveloperPreviewOnCluster(
  options: { cnvNamespace?: string } = {},
): Promise<void> {
  await patchKubevirtUiFeature(INSTANCE_TYPE_ENABLED, 'true', options);
}

/** @deprecated Use {@link enableInstanceTypesDeveloperPreviewViaConsoleApi} or cluster helper name above. */
export async function enableInstanceTypesDeveloperPreview(
  options: { cnvNamespace?: string } = {},
): Promise<void> {
  await enableInstanceTypesDeveloperPreviewOnCluster(options);
}

/**
 * Enable InstanceTypes via console proxy (post UI login). Falls back to cluster API on 403 when `oc` is available.
 */
export async function enableInstanceTypesDeveloperPreviewViaConsoleApi(
  request: APIRequestContext,
  consoleOrigin: string,
  options: { cnvNamespace?: string } & ConsoleProxyRequestOptions = {},
): Promise<void> {
  const namespace = options.cnvNamespace ?? KUBEVIRT_UI_FEATURES_NAMESPACE;
  const { csrfToken } = options;
  try {
    await patchKubevirtUiFeatureViaConsoleProxy(
      request,
      consoleOrigin,
      INSTANCE_TYPE_ENABLED,
      'true',
      namespace,
      { csrfToken },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('(403)') && canRunOc()) {
      await enableInstanceTypesDeveloperPreviewOnCluster({ cnvNamespace: namespace });
      return;
    }
    throw error;
  }
}

export async function disableInstanceTypesDeveloperPreview(
  options: { cnvNamespace?: string } = {},
): Promise<void> {
  await patchKubevirtUiFeature(INSTANCE_TYPE_ENABLED, 'false', options);
}

/** Read a key from `kubevirt-ui-features` via the console Kubernetes proxy. */
export async function getKubevirtUiFeatureViaConsoleProxy(
  request: APIRequestContext,
  consoleOrigin: string,
  featureName: string,
  cnvNamespace?: string,
  proxyOptions: ConsoleProxyRequestOptions = {},
): Promise<string | undefined> {
  const namespace = cnvNamespace ?? KUBEVIRT_UI_FEATURES_NAMESPACE;
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers = getConsoleKubernetesProxyHeaders(origin, proxyOptions);
  const url = `${origin}/api/kubernetes${configMapPath(namespace)}`;
  const get = await request.get(url, { headers });
  if (get.status() === 404) {
    return undefined;
  }
  if (!get.ok()) {
    const body = await get.text();
    throw new Error(
      `GET kubevirt-ui-features via console proxy failed (${get.status()}): ${body.slice(0, 500)}`,
    );
  }
  const body = (await get.json()) as { data?: Record<string, string> };
  return body.data?.[featureName];
}

/** Console `/api/kubernetes` proxy (tests with authenticated `APIRequestContext`). */
export async function patchKubevirtUiFeatureViaConsoleProxy(
  request: APIRequestContext,
  consoleOrigin: string,
  featureName: string,
  value: string,
  cnvNamespace?: string,
  proxyOptions: ConsoleProxyRequestOptions = {},
): Promise<void> {
  const namespace = cnvNamespace ?? KUBEVIRT_UI_FEATURES_NAMESPACE;
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers = getConsoleKubernetesProxyHeaders(origin, proxyOptions);
  const instancePath = `/api/kubernetes${configMapPath(namespace)}`;
  const url = `${origin}${instancePath}`;

  const get = await request.get(url, { headers });
  if (!get.ok() && get.status() !== 404) {
    const body = await get.text();
    throw new Error(
      `GET kubevirt-ui-features via console proxy failed (${get.status()}): ${body.slice(0, 500)}`,
    );
  }

  if (get.status() === 404) {
    const createUrl = `${origin}/api/kubernetes/api/v1/namespaces/${namespace}/configmaps`;
    const create = await request.post(createUrl, {
      data: {
        apiVersion: 'v1',
        data: { [featureName]: value },
        kind: 'ConfigMap',
        metadata: { name: KUBEVIRT_UI_FEATURES_CONFIG_MAP, namespace },
      },
      headers,
    });
    if (!create.ok()) {
      const body = await create.text();
      throw new Error(
        `Create kubevirt-ui-features via console proxy failed (${create.status()}): ${body.slice(
          0,
          500,
        )}`,
      );
    }
    return;
  }

  const patch = await request.patch(url, {
    data: { data: { [featureName]: value } },
    headers: { ...headers, 'Content-Type': 'application/merge-patch+json' },
  });
  if (!patch.ok()) {
    const body = await patch.text();
    throw new Error(
      `Patch kubevirt-ui-features via console proxy failed (${patch.status()}): ${body.slice(
        0,
        500,
      )}`,
    );
  }
}
