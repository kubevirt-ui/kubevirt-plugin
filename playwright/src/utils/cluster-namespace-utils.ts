import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import type { V1VirtualMachine, V1VirtualMachineInstance } from '@/data-models/kubevirt-types';
import type * as k8s from '@kubernetes/client-node';

import { getClusterResourceChecker } from './cluster-resource-checker';
import { EnvVariables } from './env-variables';
import { logger } from './logger';
import { TestConfigManager } from './test-config';

export interface StaleResourceConfig {
  /** Enable stale resource detection and cleanup (default: true when resource check is enabled) */
  enabled?: boolean;
  /** Maximum age in seconds for a VM to be in a transitional state (default: 120 = 2 minutes) */
  maxStaleAgeSeconds?: number;
  /** VM states considered stale/stuck (default: problematic transitional states) */
  staleStates?: string[];
  /** Whether to automatically clean up stale resources (default: true) */
  autoCleanup?: boolean;
  /** Whether cleanup should run in background without blocking (default: true) */
  backgroundCleanup?: boolean;
}

export interface StaleResource {
  name: string;
  namespace: string;
  kind: string;
  status: string;
  ageSeconds: number;
  reason?: string;
}

export const DEFAULT_STALE_CONFIG: Required<StaleResourceConfig> = {
  enabled: true,
  maxStaleAgeSeconds: 120,
  staleStates: [
    'Pending',
    'Scheduling',
    'FailedUnschedulable',
    'ErrorUnschedulable',
    'WaitingForVolumeBinding',
    'DataVolumeError',
    'ErrImagePull',
    'ImagePullBackOff',
    'CrashLoopBackOff',
    'ProvisioningFailed',
    'Unknown',
    'Terminating',
  ],
  autoCleanup: true,
  backgroundCleanup: true,
};

/**
 * Retry an operation with exponential backoff for transient network/TLS failures.
 */
export async function withK8sRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries = 3,
  initialDelayMs = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(getErrorMessage(error));
      const errorMessage = getErrorMessage(error);

      const isTransientError =
        errorMessage.includes('socket disconnected') ||
        errorMessage.includes('TLS connection') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('socket hang up') ||
        errorMessage.includes('network socket');

      if (!isTransientError || attempt === maxRetries) {
        throw error;
      }

      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      logger.warn(
        `⚠️  ${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms: ${errorMessage}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function detectStaleVMs(
  customObjectsApi: k8s.CustomObjectsApi,
  namespace: string,
  config: Required<StaleResourceConfig>,
): Promise<StaleResource[]> {
  const staleResources: StaleResource[] = [];
  const now = Date.now();

  try {
    const vmsResponse = await withK8sRetry(
      () =>
        customObjectsApi.listNamespacedCustomObject({
          group: 'kubevirt.io',
          version: 'v1',
          namespace,
          plural: 'virtualmachines',
        }),
      'List VMs for stale detection',
    );

    const listBody = (vmsResponse.body ??
      vmsResponse) as KubernetesListResource<KubernetesResource>;
    const vms = listBody.items ?? [];

    for (const vm of vms) {
      const typedVm = vm as unknown as V1VirtualMachine;
      const name = typedVm.metadata?.name;
      const printable = String(typedVm.status?.printableStatus ?? 'Unknown');
      const creationTimestamp = typedVm.metadata?.creationTimestamp;

      if (!name?.startsWith('pw-')) {
        continue;
      }

      if (!config.staleStates.includes(printable)) {
        continue;
      }

      let ageSeconds = 0;
      if (creationTimestamp) {
        const createdAt = new Date(creationTimestamp).getTime();
        ageSeconds = Math.floor((now - createdAt) / 1000);
      }

      if (ageSeconds >= config.maxStaleAgeSeconds) {
        staleResources.push({
          name,
          namespace,
          kind: 'VirtualMachine',
          status: printable,
          ageSeconds,
          reason: typedVm.status?.conditions?.[0]?.message,
        });
      }
    }
  } catch {
    // Ignore errors listing VMs
  }

  return staleResources;
}

export async function detectStaleVMIs(
  customObjectsApi: k8s.CustomObjectsApi,
  namespace: string,
  config: Required<StaleResourceConfig>,
): Promise<StaleResource[]> {
  const staleResources: StaleResource[] = [];
  const now = Date.now();

  try {
    const vmisResponse = await withK8sRetry(
      () =>
        customObjectsApi.listNamespacedCustomObject({
          group: 'kubevirt.io',
          version: 'v1',
          namespace,
          plural: 'virtualmachineinstances',
        }),
      'List VMIs for stale detection',
    );

    const vmiListBody = (vmisResponse.body ??
      vmisResponse) as KubernetesListResource<KubernetesResource>;
    const vmis = vmiListBody.items ?? [];

    for (const vmi of vmis) {
      const typedVmi = vmi as unknown as V1VirtualMachineInstance;
      const name = typedVmi.metadata?.name;
      const phase = String(typedVmi.status?.phase ?? 'Unknown');
      const creationTimestamp = typedVmi.metadata?.creationTimestamp;

      if (!name?.startsWith('pw-')) {
        continue;
      }

      const stuckVmiStates = ['Pending', 'Scheduling', 'Failed', 'Unknown'];
      if (!stuckVmiStates.includes(phase)) {
        continue;
      }

      let ageSeconds = 0;
      if (creationTimestamp) {
        const createdAt = new Date(creationTimestamp).getTime();
        ageSeconds = Math.floor((now - createdAt) / 1000);
      }

      if (ageSeconds >= config.maxStaleAgeSeconds) {
        staleResources.push({
          name,
          namespace,
          kind: 'VirtualMachineInstance',
          status: phase,
          ageSeconds,
          reason: typedVmi.status?.conditions?.[0]?.message,
        });
      }
    }
  } catch {
    // Ignore errors listing VMIs
  }

  return staleResources;
}

export async function cleanupStaleResource(
  customObjectsApi: k8s.CustomObjectsApi,
  resource: StaleResource,
  verbose: boolean,
): Promise<boolean> {
  try {
    if (resource.kind === 'VirtualMachine') {
      try {
        const vmResponse = await customObjectsApi.getNamespacedCustomObject({
          group: 'kubevirt.io',
          version: 'v1',
          namespace: resource.namespace,
          plural: 'virtualmachines',
          name: resource.name,
        });

        const vmBody = vmResponse.body ?? vmResponse;
        const vm = vmBody as KubernetesResource;
        const deleteProtectionLabels = vm.metadata?.labels as
          | Record<string, string | undefined>
          | undefined;
        const deleteProtection = deleteProtectionLabels?.['kubevirt.io/vm-delete-protection'];

        if (deleteProtection === 'enabled' || deleteProtection === 'true') {
          if (verbose) {
            logger.info(`[StaleCleanup] Removing delete protection from ${resource.name}`);
          }

          await customObjectsApi.patchNamespacedCustomObject({
            group: 'kubevirt.io',
            version: 'v1',
            namespace: resource.namespace,
            plural: 'virtualmachines',
            name: resource.name,
            body: {
              metadata: {
                labels: {
                  'kubevirt.io/vm-delete-protection': null,
                },
              },
            },
          });

          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch {
        // Ignore errors checking/removing delete protection
      }

      await customObjectsApi.deleteNamespacedCustomObject({
        group: 'kubevirt.io',
        version: 'v1',
        namespace: resource.namespace,
        plural: 'virtualmachines',
        name: resource.name,
      });

      if (verbose) {
        logger.info(
          `[StaleCleanup] Deleted stale VM: ${resource.name} (${resource.status}, ${Math.round(
            resource.ageSeconds / 60,
          )}min old)`,
        );
      }
      return true;
    } else if (resource.kind === 'VirtualMachineInstance') {
      await customObjectsApi.deleteNamespacedCustomObject({
        group: 'kubevirt.io',
        version: 'v1',
        namespace: resource.namespace,
        plural: 'virtualmachineinstances',
        name: resource.name,
      });

      if (verbose) {
        logger.info(
          `[StaleCleanup] Deleted stale VMI: ${resource.name} (${resource.status}, ${Math.round(
            resource.ageSeconds / 60,
          )}min old)`,
        );
      }
      return true;
    }

    return false;
  } catch (error) {
    if (verbose) {
      logger.warn(`[StaleCleanup] Failed to delete ${resource.kind} ${resource.name}: ${error}`);
    }
    return false;
  }
}

export async function cleanupStaleResources(
  customObjectsApi: k8s.CustomObjectsApi,
  staleResources: StaleResource[],
  verbose: boolean,
): Promise<string[]> {
  const cleanedUp: string[] = [];

  const results = await Promise.allSettled(
    staleResources.map(async (resource) => {
      const success = await cleanupStaleResource(customObjectsApi, resource, verbose);
      if (success) {
        return `${resource.kind}/${resource.name}`;
      }
      return null;
    }),
  );

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      cleanedUp.push(result.value);
    }
  }

  return cleanedUp;
}

export async function cleanupStaleClusterResources(
  options: Partial<StaleResourceConfig> = {},
  verbose = false,
): Promise<string[]> {
  const checker = getClusterResourceChecker();
  const config: Required<StaleResourceConfig> = { ...DEFAULT_STALE_CONFIG, ...options };

  const initialized = await checker.initialize();
  if (!initialized) return [];

  const [staleVMs, staleVMIs] = await Promise.all([
    checker.detectStaleVMs(config),
    checker.detectStaleVMIs(config),
  ]);

  const staleResources: StaleResource[] = [...staleVMs, ...staleVMIs];

  if (staleResources.length === 0) {
    if (verbose) logger.info('[StaleCleanup] No stale resources found');
    return [];
  }

  if (verbose) {
    logger.info(`[StaleCleanup] Found ${staleResources.length} stale resource(s), cleaning up...`);
  }

  return checker.cleanupStaleResources(staleResources, verbose);
}

function readKubeClientErrorParts(error: unknown): {
  statusCode?: number;
  code?: number;
  bodyCode?: number;
} {
  if (typeof error !== 'object' || error === null) return {};
  const o = error as Record<string, unknown>;
  const body =
    typeof o.body === 'object' && o.body !== null ? (o.body as Record<string, unknown>) : undefined;
  const bc = typeof body?.code === 'number' ? body.code : undefined;
  return {
    statusCode: typeof o.statusCode === 'number' ? o.statusCode : undefined,
    code: typeof o.code === 'number' ? o.code : undefined,
    bodyCode: bc,
  };
}

export async function waitForNamespaceReady(
  namespace?: string,
  timeoutMs = 30000,
  verbose = false,
): Promise<boolean> {
  const config = TestConfigManager.getConfig();
  const ns = namespace || config.testNamespace || EnvVariables.testNamespace;

  if (!ns) {
    if (verbose) logger.warn('[NamespaceCheck] No namespace configured, skipping check');
    return true;
  }

  const checker = getClusterResourceChecker();
  const initialized = await checker.initialize();

  if (!initialized) {
    if (verbose) logger.warn('[NamespaceCheck] Could not initialize k8s client, skipping check');
    return true;
  }

  const startTime = Date.now();
  const intervalMs = 1000;
  let attemptedCreate = false;

  if (verbose) logger.info(`[NamespaceCheck] Waiting for namespace '${ns}' to be ready...`);

  while (Date.now() - startTime < timeoutMs) {
    try {
      const coreApi = checker.getCoreV1Api();
      const nsResponse = await coreApi.readNamespace({ name: ns });

      if (nsResponse.status?.phase === 'Active') {
        if (verbose) logger.info(`[NamespaceCheck] Namespace '${ns}' is ready`);
        return true;
      }
    } catch (error: unknown) {
      const errMsg = getErrorMessage(error).toLowerCase();
      const { statusCode, code, bodyCode } = readKubeClientErrorParts(error);
      const is404 =
        statusCode === 404 ||
        code === 404 ||
        bodyCode === 404 ||
        errMsg.includes('404') ||
        errMsg.includes('not found');

      if (is404 && !attemptedCreate) {
        attemptedCreate = true;
        if (verbose) {
          logger.info(`[NamespaceCheck] Namespace '${ns}' not found, attempting to create...`);
        }
        try {
          const coreApi = checker.getCoreV1Api();
          await coreApi.createNamespace({
            body: {
              apiVersion: 'v1',
              kind: 'Namespace',
              metadata: { name: ns },
            },
          });
          if (verbose) logger.info(`[NamespaceCheck] Created namespace '${ns}'`);
        } catch (createError: unknown) {
          const createMsg = getErrorMessage(createError).toLowerCase();
          const cre = readKubeClientErrorParts(createError);
          const is409 =
            cre.statusCode === 409 ||
            cre.code === 409 ||
            cre.bodyCode === 409 ||
            createMsg.includes('409') ||
            createMsg.includes('already exists');

          if (!is409 && verbose) {
            logger.warn(
              `[NamespaceCheck] Failed to create namespace: ${getErrorMessage(createError)}`,
            );
          }
        }
      } else if (!is404 && verbose) {
        logger.warn(`[NamespaceCheck] Error checking namespace: ${getErrorMessage(error)}`);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  if (verbose) {
    logger.warn(`[NamespaceCheck] Timeout waiting for namespace '${ns}' after ${timeoutMs}ms`);
  }

  return false;
}
