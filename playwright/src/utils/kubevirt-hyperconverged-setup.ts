import { setTimeout as sleep } from 'node:timers/promises';

import { clusterKubernetesJson } from '@/utils/cluster-kubernetes-api';
import { canRunOc } from '@/utils/cluster-oc';
import {
  type ConsoleProxyRequestOptions,
  getConsoleKubernetesProxyHeaders,
} from '@/utils/console-kubernetes-proxy';
import { EnvVariables } from '@/utils/env-variables';
import { KUBEVIRT_HYPERCONVERGED_NAME } from '@/utils/kubevirt-ui-features';
import { TestTimeouts } from '@/utils/test-config';
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

/** HCO reconcile often mutates the underlying KubeVirt CR between consecutive patches. */
const HCO_CONFLICT_MAX_ATTEMPTS = 5;

type JsonPatchOp =
  | { op: 'add'; path: string; value: boolean | Record<string, string> | string }
  | { op: 'replace'; path: string; value: boolean | string };

function hyperConvergedApiPath(cnvNamespace: string): string {
  return `/apis/hco.kubevirt.io/v1beta1/namespaces/${cnvNamespace}/hyperconvergeds/${KUBEVIRT_HYPERCONVERGED_NAME}`;
}

function cnvNamespace(options: { cnvNamespace?: string } = {}): string {
  return options.cnvNamespace ?? process.env.CNV_NAMESPACE ?? 'openshift-cnv';
}

function isConflictStatus(status: number): boolean {
  return status === 409;
}

function isConflictErrorMessage(message: string): boolean {
  return message.includes('(409)') || /object has been modified/i.test(message);
}

async function withHcoConflictRetry(operation: () => Promise<void>): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= HCO_CONFLICT_MAX_ATTEMPTS; attempt += 1) {
    try {
      await operation();
      return;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!isConflictErrorMessage(message) || attempt === HCO_CONFLICT_MAX_ATTEMPTS) {
        throw error;
      }
      await sleep(TestTimeouts.RETRY_DELAY);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
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
  await withHcoConflictRetry(async () => {
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
  });
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

  await withHcoConflictRetry(async () => {
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
      if (isConflictStatus(add.status())) {
        const addBody = await add.text();
        throw new Error(
          `JSON Patch HyperConverged via console proxy failed (${add.status()}): ${addBody.slice(
            0,
            500,
          )}`,
        );
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
  });
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

/** Pending KubeVirt patches on HyperConverged (matches `useVMTemplateFeatureFlag`). */
export const KUBEVIRT_JSONPATCH_ANNOTATION = 'kubevirt.kubevirt.io/jsonpatch';

/** Feature gate for native VirtualMachine templates (Settings → User → preview). */
export const TEMPLATE_FEATURE_GATE = 'Template';

const ADD_TEMPLATE_FEATURE_GATE_PATCH = {
  op: 'add' as const,
  path: '/spec/configuration/developerConfiguration/featureGates/-',
  value: TEMPLATE_FEATURE_GATE,
};

type HyperConvergedResource = {
  metadata?: { annotations?: Record<string, string> };
  spec?: {
    configuration?: { developerConfiguration?: { featureGates?: string[] } };
    featureGates?: Record<string, boolean>;
  };
};

function escapeJsonPointerToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

function parseJsonPatchAnnotation(annotationValue: string | undefined): JsonPatchOp[] {
  if (!annotationValue) {
    return [];
  }
  try {
    const parsed = JSON.parse(annotationValue) as unknown;
    return Array.isArray(parsed) ? (parsed as JsonPatchOp[]) : [];
  } catch {
    return [];
  }
}

function isTemplateFeatureGatePatch(patch: JsonPatchOp): boolean {
  return (
    patch.op === ADD_TEMPLATE_FEATURE_GATE_PATCH.op &&
    patch.path === ADD_TEMPLATE_FEATURE_GATE_PATCH.path &&
    patch.value === ADD_TEMPLATE_FEATURE_GATE_PATCH.value
  );
}

function templateFeatureAlreadyEnabled(hco: HyperConvergedResource): boolean {
  const gates = hco.spec?.configuration?.developerConfiguration?.featureGates ?? [];
  return gates.includes(TEMPLATE_FEATURE_GATE);
}

function buildNativeVmTemplatesPreviewPatchOps(hco: HyperConvergedResource): JsonPatchOp[] {
  if (templateFeatureAlreadyEnabled(hco)) {
    return [];
  }
  const annotations = hco.metadata?.annotations ?? {};
  const operations = parseJsonPatchAnnotation(annotations[KUBEVIRT_JSONPATCH_ANNOTATION]);
  if (operations.some(isTemplateFeatureGatePatch)) {
    return [];
  }
  const nextOperations = [...operations, ADD_TEMPLATE_FEATURE_GATE_PATCH];
  const annotationJson = JSON.stringify(nextOperations);
  const annotPath = `/metadata/annotations/${escapeJsonPointerToken(
    KUBEVIRT_JSONPATCH_ANNOTATION,
  )}`;
  const patchOps: JsonPatchOp[] = [];
  if (!hco.metadata?.annotations) {
    patchOps.push({ op: 'add', path: '/metadata/annotations', value: {} });
  }
  patchOps.push(
    KUBEVIRT_JSONPATCH_ANNOTATION in annotations
      ? { op: 'replace', path: annotPath, value: annotationJson }
      : { op: 'add', path: annotPath, value: annotationJson },
  );
  return patchOps;
}

async function getHyperConvergedOnCluster(
  namespace: string,
  kubeconfigPath: string | undefined,
): Promise<HyperConvergedResource | null> {
  const response = await clusterKubernetesJson(
    'GET',
    hyperConvergedApiPath(namespace),
    undefined,
    undefined,
    kubeconfigPath,
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(
      `GET HyperConverged failed (${response.status}): ${response.text.slice(0, 500)}`,
    );
  }
  return JSON.parse(response.text) as HyperConvergedResource;
}

async function getHyperConvergedViaConsole(
  request: APIRequestContext,
  consoleOrigin: string,
  namespace: string,
  proxyOptions: ConsoleProxyRequestOptions,
): Promise<HyperConvergedResource | null> {
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers = getConsoleKubernetesProxyHeaders(origin, proxyOptions);
  const url = `${origin}/api/kubernetes${hyperConvergedApiPath(namespace)}`;
  const get = await request.get(url, { headers });
  if (get.status() === 404) {
    return null;
  }
  if (!get.ok()) {
    const body = await get.text();
    throw new Error(
      `GET HyperConverged via console proxy failed (${get.status()}): ${body.slice(0, 500)}`,
    );
  }
  return (await get.json()) as HyperConvergedResource;
}

/** Preview: **Enable native VirtualMachine templates** (user templates in VM wizard). */
export async function enableNativeVmTemplatesPreviewOnCluster(
  options: { cnvNamespace?: string; kubeconfigPath?: string } = {},
): Promise<void> {
  const namespace = cnvNamespace(options);
  const hco = await getHyperConvergedOnCluster(namespace, options.kubeconfigPath);
  if (!hco) {
    return;
  }
  const patchOps = buildNativeVmTemplatesPreviewPatchOps(hco);
  if (patchOps.length === 0) {
    return;
  }
  await withHcoConflictRetry(async () => {
    // Re-read inside retries so resourceVersion/annotation races do not 409 forever.
    const latest = await getHyperConvergedOnCluster(namespace, options.kubeconfigPath);
    if (!latest) {
      return;
    }
    const latestOps = buildNativeVmTemplatesPreviewPatchOps(latest);
    if (latestOps.length === 0) {
      return;
    }
    await patchHyperConvergedOnCluster(
      namespace,
      latestOps,
      options.kubeconfigPath,
      KUBEVIRT_JSONPATCH_ANNOTATION,
    );
  });
}

export async function enableNativeVmTemplatesPreviewViaConsoleApi(
  request: APIRequestContext,
  consoleOrigin: string,
  options: { cnvNamespace?: string } & ConsoleProxyRequestOptions = {},
): Promise<void> {
  const namespace = options.cnvNamespace ?? EnvVariables.cnvNamespace;
  const origin = consoleOrigin.replace(/\/$/, '');
  const headers = {
    ...getConsoleKubernetesProxyHeaders(origin, options),
    'Content-Type': 'application/json-patch+json',
  };
  const url = `${origin}/api/kubernetes${hyperConvergedApiPath(namespace)}`;

  let hco: HyperConvergedResource | null;
  try {
    hco = await getHyperConvergedViaConsole(request, consoleOrigin, namespace, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('(403)') && canRunOc()) {
      await enableNativeVmTemplatesPreviewOnCluster({ cnvNamespace: namespace });
      return;
    }
    throw error;
  }
  if (!hco) {
    return;
  }
  await withHcoConflictRetry(async () => {
    const latest = await getHyperConvergedViaConsole(request, consoleOrigin, namespace, options);
    if (!latest) {
      return;
    }
    const latestOps = buildNativeVmTemplatesPreviewPatchOps(latest);
    if (latestOps.length === 0) {
      return;
    }
    const patch = await request.patch(url, { data: latestOps, headers });
    if (patch.ok()) {
      return;
    }
    if (patch.status() === 403 && canRunOc()) {
      await enableNativeVmTemplatesPreviewOnCluster({ cnvNamespace: namespace });
      return;
    }
    if (isConflictStatus(patch.status())) {
      const conflictBody = await patch.text();
      throw new Error(
        `Patch native VM templates preview on HyperConverged failed (${patch.status()}): ${conflictBody.slice(
          0,
          500,
        )}`,
      );
    }
    const body = await patch.text();
    throw new Error(
      `Patch native VM templates preview on HyperConverged failed (${patch.status()}): ${body.slice(
        0,
        500,
      )}`,
    );
  });
}
