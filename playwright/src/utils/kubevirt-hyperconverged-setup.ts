import { clusterKubernetesJson } from '@/utils/cluster-kubernetes-api';
import { canRunOc } from '@/utils/cluster-oc';
import {
  type ConsoleProxyRequestOptions,
  getConsoleKubernetesProxyHeaders,
} from '@/utils/console-kubernetes-proxy';
import { EnvVariables } from '@/utils/env-variables';
import { KUBEVIRT_HYPERCONVERGED_NAME } from '@/utils/kubevirt-ui-features';
import type { APIRequestContext } from '@playwright/test';

/** HCO annotation — Preview: **Enable Passt binding for primary user-defined networks** (`usePasstFeatureFlag`). */
export const DEPLOY_PASST_NETWORK_BINDING_ANNOTATION = 'hco.kubevirt.io/deployPasstNetworkBinding';

/** HCO feature gate — Preview: **Enable advanced CD-ROM features** (`useAdvancedCDROMFeatureFlag`). */
export const DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE = 'declarativeHotplugVolumes';

const DEPLOY_PASST_JSON_PATCH_PATH = `/metadata/annotations/${DEPLOY_PASST_NETWORK_BINDING_ANNOTATION.replace(
  '/',
  '~1',
)}`;

const DECLARATIVE_HOTPLUG_VOLUMES_JSON_PATCH_PATH = `/spec/featureGates/${DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE}`;

type JsonPatchOp =
  | { op: 'add'; path: string; value: boolean | string }
  | { op: 'replace'; path: string; value: boolean | string };

function hyperConvergedApiPath(cnvNamespace: string): string {
  return `/apis/hco.kubevirt.io/v1beta1/namespaces/${cnvNamespace}/hyperconvergeds/${KUBEVIRT_HYPERCONVERGED_NAME}`;
}

function cnvNamespace(options: { cnvNamespace?: string } = {}): string {
  return options.cnvNamespace ?? process.env.CNV_NAMESPACE ?? 'openshift-cnv';
}

async function patchHyperConvergedOnCluster(
  namespace: string,
  patchOps: JsonPatchOp[],
  kubeconfigPath: string | undefined,
  context: string,
): Promise<void> {
  const response = await clusterKubernetesJson(
    'PATCH',
    hyperConvergedApiPath(namespace),
    patchOps,
    { 'Content-Type': 'application/json-patch+json' },
    kubeconfigPath,
  );
  if (response.ok) {
    return;
  }
  throw new Error(`Patch ${context} failed (${response.status}): ${response.text.slice(0, 500)}`);
}

async function applyReplaceWithAddFallbackOnCluster(
  namespace: string,
  path: string,
  value: boolean | string,
  kubeconfigPath: string | undefined,
  context: string,
): Promise<void> {
  try {
    await patchHyperConvergedOnCluster(
      namespace,
      [{ op: 'replace', path, value }],
      kubeconfigPath,
      context,
    );
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('(422)')) {
      throw error;
    }
  }
  await patchHyperConvergedOnCluster(
    namespace,
    [{ op: 'add', path, value }],
    kubeconfigPath,
    context,
  );
}

async function applyReplaceWithAddFallbackViaConsole(
  request: APIRequestContext,
  consoleOrigin: string,
  namespace: string,
  path: string,
  value: boolean | string,
  proxyOptions: ConsoleProxyRequestOptions,
  on403Fallback: () => Promise<void>,
): Promise<void> {
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers = {
    ...getConsoleKubernetesProxyHeaders(origin, proxyOptions),
    'Content-Type': 'application/json-patch+json',
  };
  const url = `${origin}/api/kubernetes${hyperConvergedApiPath(namespace)}`;
  const replace = await request.patch(url, {
    data: [{ op: 'replace', path, value }],
    headers,
  });
  if (replace.ok()) {
    return;
  }
  if (replace.status() === 422) {
    const add = await request.patch(url, {
      data: [{ op: 'add', path, value }],
      headers,
    });
    if (add.ok()) {
      return;
    }
  }
  if (replace.status() === 403 && canRunOc()) {
    await on403Fallback();
    return;
  }
  const body = await replace.text();
  throw new Error(
    `JSON Patch HyperConverged via console proxy failed (${replace.status()}): ${body.slice(
      0,
      500,
    )}`,
  );
}

/** Preview feature: Enable Passt binding for primary user-defined networks (HCO annotation). */
export async function enableDeployPasstNetworkBindingOnCluster(
  options: { cnvNamespace?: string; kubeconfigPath?: string } = {},
): Promise<void> {
  const namespace = cnvNamespace(options);
  await applyReplaceWithAddFallbackOnCluster(
    namespace,
    DEPLOY_PASST_JSON_PATCH_PATH,
    'true',
    options.kubeconfigPath,
    DEPLOY_PASST_NETWORK_BINDING_ANNOTATION,
  );
}

export async function enableDeployPasstNetworkBindingViaConsoleApi(
  request: APIRequestContext,
  consoleOrigin: string,
  options: { cnvNamespace?: string } & ConsoleProxyRequestOptions = {},
): Promise<void> {
  const namespace = options.cnvNamespace ?? EnvVariables.cnvNamespace;
  await applyReplaceWithAddFallbackViaConsole(
    request,
    consoleOrigin,
    namespace,
    DEPLOY_PASST_JSON_PATCH_PATH,
    'true',
    options,
    () => enableDeployPasstNetworkBindingOnCluster({ cnvNamespace: namespace }),
  );
}

/** Preview feature: Enable advanced CD-ROM features (`declarativeHotplugVolumes` gate). */
export async function enableDeclarativeHotplugVolumesOnCluster(
  options: { cnvNamespace?: string; kubeconfigPath?: string } = {},
): Promise<void> {
  const namespace = cnvNamespace(options);
  await applyReplaceWithAddFallbackOnCluster(
    namespace,
    DECLARATIVE_HOTPLUG_VOLUMES_JSON_PATCH_PATH,
    true,
    options.kubeconfigPath,
    DECLARATIVE_HOTPLUG_VOLUMES_FEATURE_GATE,
  );
}

export async function enableDeclarativeHotplugVolumesViaConsoleApi(
  request: APIRequestContext,
  consoleOrigin: string,
  options: { cnvNamespace?: string } & ConsoleProxyRequestOptions = {},
): Promise<void> {
  const namespace = options.cnvNamespace ?? EnvVariables.cnvNamespace;
  await applyReplaceWithAddFallbackViaConsole(
    request,
    consoleOrigin,
    namespace,
    DECLARATIVE_HOTPLUG_VOLUMES_JSON_PATCH_PATH,
    true,
    options,
    () => enableDeclarativeHotplugVolumesOnCluster({ cnvNamespace: namespace }),
  );
}
