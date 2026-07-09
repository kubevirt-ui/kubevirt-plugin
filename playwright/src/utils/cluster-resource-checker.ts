/**
 * Utility to check cluster resource utilization before running tests.
 * Helps prevent test failures by waiting for cluster resources to be below thresholds.
 * Also detects and cleans up stale resources (VMs stuck in problematic states).
 */

import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import * as k8s from '@kubernetes/client-node';

import { EnvVariables } from './env-variables';
import { logger } from './logger';
import { TestConfigManager } from './test-config';

export interface ResourceThresholds {
  maxRunningVms?: number;
  maxPendingPods?: number;
  maxVmis?: number;
}

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

export interface ResourceCheckResult {
  belowThreshold: boolean;
  runningVms: number;
  pendingPods: number;
  vmis: number;
  message: string;
  staleResources?: StaleResource[];
  cleanedUpResources?: string[];
}

export interface WaitForResourcesOptions {
  thresholds?: ResourceThresholds;
  timeout?: number;
  interval?: number;
  verbose?: boolean;
  staleResourceConfig?: StaleResourceConfig;
}

const DEFAULT_THRESHOLDS: Required<ResourceThresholds> = {
  maxRunningVms: 10,
  maxPendingPods: 5,
  maxVmis: 10,
};

const DEFAULT_STALE_CONFIG: Required<StaleResourceConfig> = {
  enabled: true,
  maxStaleAgeSeconds: 120, // 2 minutes
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

const DEFAULT_OPTIONS: Required<
  Omit<WaitForResourcesOptions, 'thresholds' | 'staleResourceConfig'>
> = {
  timeout: 60000,
  interval: 5000,
  verbose: false,
};

export class ClusterResourceChecker {
  private backgroundCleanupPromise: Promise<void> | null = null;
  private coreApi: k8s.CoreV1Api;
  private customObjectsApi: k8s.CustomObjectsApi;
  private isInitialized = false;
  private kc: k8s.KubeConfig;
  private namespace: string;

  constructor() {
    this.kc = new k8s.KubeConfig();
    this.namespace = '';
    this.customObjectsApi = null as unknown as k8s.CustomObjectsApi;
    this.coreApi = null as unknown as k8s.CoreV1Api;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry an operation with exponential backoff for transient network/TLS failures.
   * Handles common connection issues like socket disconnects and TLS handshake failures.
   */
  private async withRetry<T>(
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

        // Check if it's a transient network/TLS error worth retrying
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

  async checkResources(
    thresholds: ResourceThresholds = {},
    staleConfig?: StaleResourceConfig,
    verbose = false,
  ): Promise<ResourceCheckResult> {
    const mergedThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    const mergedStaleConfig: Required<StaleResourceConfig> = {
      ...DEFAULT_STALE_CONFIG,
      ...staleConfig,
    };

    const initialized = await this.initialize();
    if (!initialized) {
      return {
        belowThreshold: true, // Assume OK if we can't check
        runningVms: 0,
        pendingPods: 0,
        vmis: 0,
        message: 'Unable to initialize Kubernetes client, skipping resource check',
      };
    }

    try {
      let runningVms = 0;
      try {
        const rawList = await this.withRetry(
          () =>
            this.customObjectsApi.listNamespacedCustomObject({
              group: 'kubevirt.io',
              version: 'v1',
              namespace: this.namespace,
              plural: 'virtualmachines',
            }),
          'List VMs for count',
        );
        const vmListBody = (rawList.body ?? rawList) as KubernetesListResource<KubernetesResource>;
        const vmItems = vmListBody.items ?? [];
        runningVms = vmItems.filter((vm) => {
          const st = vm.status as Record<string, unknown> | undefined;
          const spec = vm.spec as Record<string, unknown> | undefined;
          return st?.printableStatus === 'Running' || spec?.running === true;
        }).length;
      } catch {
        // If we can't list VMs, assume 0
        runningVms = 0;
      }

      let vmis = 0;
      try {
        const rawVmis = await this.withRetry(
          () =>
            this.customObjectsApi.listNamespacedCustomObject({
              group: 'kubevirt.io',
              version: 'v1',
              namespace: this.namespace,
              plural: 'virtualmachineinstances',
            }),
          'List VMIs for count',
        );
        const vmiListAll = (rawVmis.body ?? rawVmis) as KubernetesListResource<KubernetesResource>;
        vmis = (vmiListAll.items ?? []).length;
      } catch {
        vmis = 0;
      }

      let pendingPods = 0;
      try {
        const podsResponse = await this.withRetry(
          () => this.coreApi.listNamespacedPod({ namespace: this.namespace }),
          'List pending pods',
        );
        pendingPods = (podsResponse.items || []).filter(
          (pod) => pod.status?.phase === 'Pending',
        ).length;
      } catch {
        pendingPods = 0;
      }

      let staleResources: StaleResource[] = [];
      let cleanedUpResources: string[] = [];

      if (mergedStaleConfig.enabled) {
        const [staleVMs, staleVMIs] = await Promise.all([
          this.detectStaleVMs(mergedStaleConfig),
          this.detectStaleVMIs(mergedStaleConfig),
        ]);

        staleResources = [...staleVMs, ...staleVMIs];

        if (staleResources.length > 0 && verbose) {
          logger.warn(
            `[ResourceCheck] Found ${staleResources.length} stale resource(s): ${staleResources
              .map((r) => `${r.kind}/${r.name} (${r.status})`)
              .join(', ')}`,
          );
        }

        if (staleResources.length > 0 && mergedStaleConfig.autoCleanup) {
          if (mergedStaleConfig.backgroundCleanup) {
            this.backgroundCleanupPromise = this.cleanupStaleResources(
              staleResources,
              verbose,
            ).then((cleaned) => {
              if (cleaned.length > 0 && verbose) {
                logger.info(
                  `[ResourceCheck] Background cleanup completed: ${cleaned.length} resource(s) cleaned`,
                );
              }
            });
          } else {
            cleanedUpResources = await this.cleanupStaleResources(staleResources, verbose);
          }
        }
      }

      const belowThreshold =
        runningVms <= mergedThresholds.maxRunningVms &&
        pendingPods <= mergedThresholds.maxPendingPods &&
        vmis <= mergedThresholds.maxVmis;

      const message = belowThreshold
        ? `Resources OK: ${runningVms} running VMs, ${vmis} VMIs, ${pendingPods} pending pods${
            staleResources.length > 0 ? `, ${staleResources.length} stale (cleaning up)` : ''
          }`
        : `Resources above threshold: ${runningVms}/${mergedThresholds.maxRunningVms} VMs, ` +
          `${vmis}/${mergedThresholds.maxVmis} VMIs, ${pendingPods}/${mergedThresholds.maxPendingPods} pending pods`;

      return {
        belowThreshold,
        runningVms,
        pendingPods,
        vmis,
        message,
        staleResources: staleResources.length > 0 ? staleResources : undefined,
        cleanedUpResources: cleanedUpResources.length > 0 ? cleanedUpResources : undefined,
      };
    } catch (error) {
      // If we can't check, assume OK and continue
      return {
        belowThreshold: true,
        runningVms: 0,
        pendingPods: 0,
        vmis: 0,
        message: `Resource check failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  }

  /**
   * Clean up a single stale resource.
   */
  async cleanupStaleResource(resource: StaleResource, verbose: boolean): Promise<boolean> {
    try {
      if (resource.kind === 'VirtualMachine') {
        // First, remove delete protection if present
        try {
          const vmResponse = await this.customObjectsApi.getNamespacedCustomObject({
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

            await this.customObjectsApi.patchNamespacedCustomObject({
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

            // Wait a moment for the patch to apply
            await this.sleep(500);
          }
        } catch {
          // Ignore errors checking/removing delete protection
        }

        await this.customObjectsApi.deleteNamespacedCustomObject({
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
        await this.customObjectsApi.deleteNamespacedCustomObject({
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

  /**
   * Clean up all detected stale resources.
   */
  async cleanupStaleResources(
    staleResources: StaleResource[],
    verbose: boolean,
  ): Promise<string[]> {
    const cleanedUp: string[] = [];

    const results = await Promise.allSettled(
      staleResources.map(async (resource) => {
        const success = await this.cleanupStaleResource(resource, verbose);
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

  /**
   * Detect stale VMIs (VirtualMachineInstances) that have been running too long or are stuck.
   */
  async detectStaleVMIs(config: Required<StaleResourceConfig>): Promise<StaleResource[]> {
    const staleResources: StaleResource[] = [];
    const now = Date.now();

    try {
      const vmisResponse = await this.withRetry(
        () =>
          this.customObjectsApi.listNamespacedCustomObject({
            group: 'kubevirt.io',
            version: 'v1',
            namespace: this.namespace,
            plural: 'virtualmachineinstances',
          }),
        'List VMIs for stale detection',
      );

      const vmiListBody = (vmisResponse.body ??
        vmisResponse) as KubernetesListResource<KubernetesResource>;
      const vmis = vmiListBody.items ?? [];

      for (const vmi of vmis) {
        const name = vmi.metadata?.name;
        const phase = String(
          (vmi.status as Record<string, unknown> | undefined)?.phase ?? 'Unknown',
        );
        const creationTimestamp = vmi.metadata?.creationTimestamp;

        // Only check VMIs with 'pw-' prefix (test VMIs)
        if (!name?.startsWith('pw-')) {
          continue;
        }

        // VMI stuck states
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
          const vmiStatus = vmi.status as Record<string, unknown> | undefined;
          staleResources.push({
            name,
            namespace: this.namespace,
            kind: 'VirtualMachineInstance',
            status: phase,
            ageSeconds,
            reason: Array.isArray(vmiStatus?.conditions)
              ? (vmiStatus.conditions as Array<{ message?: string }>)[0]?.message
              : undefined,
          });
        }
      }
    } catch {
      // Ignore errors listing VMIs
    }

    return staleResources;
  }

  /**
   * Detect stale VMs that have been in problematic states for too long.
   */
  async detectStaleVMs(config: Required<StaleResourceConfig>): Promise<StaleResource[]> {
    const staleResources: StaleResource[] = [];
    const now = Date.now();

    try {
      const vmsResponse = await this.withRetry(
        () =>
          this.customObjectsApi.listNamespacedCustomObject({
            group: 'kubevirt.io',
            version: 'v1',
            namespace: this.namespace,
            plural: 'virtualmachines',
          }),
        'List VMs for stale detection',
      );

      const listBody = (vmsResponse.body ??
        vmsResponse) as KubernetesListResource<KubernetesResource>;
      const vms = listBody.items ?? [];

      for (const vm of vms) {
        const name = vm.metadata?.name;
        const statusRec = vm.status as Record<string, unknown> | undefined;
        const printable = String(statusRec?.printableStatus ?? 'Unknown');
        const creationTimestamp = vm.metadata?.creationTimestamp;

        // Only check VMs with 'pw-' prefix (test VMs)
        if (!name?.startsWith('pw-')) {
          continue;
        }

        // Check if VM is in a stale state
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
            namespace: this.namespace,
            kind: 'VirtualMachine',
            status: printable,
            ageSeconds,
            reason: Array.isArray(statusRec?.conditions)
              ? (statusRec.conditions as Array<{ message?: string }>)[0]?.message
              : undefined,
          });
        }
      }
    } catch {
      // Ignore errors listing VMs
    }

    return staleResources;
  }

  /** Core V1 API client (valid after {@link initialize} returns true). */
  getCoreV1Api(): k8s.CoreV1Api {
    return this.coreApi;
  }

  /** Initialize Kubernetes clients from test config (kubeconfig, token, or defaults). */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      const config = TestConfigManager.getConfig();
      this.namespace = config.testNamespace || EnvVariables.testNamespace;

      if (config.kubeConfigPath) {
        try {
          this.kc.loadFromFile(config.kubeConfigPath);
        } catch {
          // Fall back to token-based auth
          if (config.authToken) {
            this.kc.loadFromOptions({
              clusters: [{ name: 'cluster', server: EnvVariables.clusterUrl, skipTLSVerify: true }],
              contexts: [{ cluster: 'cluster', name: 'context', user: 'user' }],
              currentContext: 'context',
              users: [{ name: 'user', token: config.authToken }],
            });
          } else {
            return false;
          }
        }
      } else if (config.authToken) {
        this.kc.loadFromOptions({
          clusters: [{ name: 'cluster', server: EnvVariables.clusterUrl, skipTLSVerify: true }],
          contexts: [{ cluster: 'cluster', name: 'context', user: 'user' }],
          currentContext: 'context',
          users: [{ name: 'user', token: config.authToken }],
        });
      } else {
        try {
          this.kc.loadFromDefault();
        } catch {
          return false;
        }
      }

      this.customObjectsApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
      this.coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
      this.isInitialized = true;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for any background cleanup operations to complete.
   * Call this if you need to ensure cleanup is done before proceeding.
   */
  async waitForBackgroundCleanup(): Promise<void> {
    if (this.backgroundCleanupPromise) {
      await this.backgroundCleanupPromise;
      this.backgroundCleanupPromise = null;
    }
  }

  async waitForResources(options: WaitForResourcesOptions = {}): Promise<ResourceCheckResult> {
    const { timeout, interval, verbose } = { ...DEFAULT_OPTIONS, ...options };
    const thresholds = { ...DEFAULT_THRESHOLDS, ...options.thresholds };
    const staleConfig = { ...DEFAULT_STALE_CONFIG, ...options.staleResourceConfig };

    const startTime = Date.now();
    let lastResult: ResourceCheckResult;

    lastResult = await this.checkResources(thresholds, staleConfig, verbose);

    if (lastResult.belowThreshold) {
      if (verbose) {
        logger.info(`[ResourceCheck] ${lastResult.message}`);
      }
      return lastResult;
    }

    if (verbose) {
      logger.info(`[ResourceCheck] Waiting for resources to be available: ${lastResult.message}`);
    }

    while (Date.now() - startTime < timeout) {
      await this.sleep(interval);

      lastResult = await this.checkResources(thresholds, staleConfig, verbose);

      if (lastResult.belowThreshold) {
        if (verbose) {
          logger.info(`[ResourceCheck] Resources now available: ${lastResult.message}`);
        }
        return lastResult;
      }

      if (verbose) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        logger.info(`[ResourceCheck] Still waiting (${elapsed}s): ${lastResult.message}`);
      }
    }

    if (verbose) {
      logger.warn(`[ResourceCheck] Timeout reached, continuing anyway: ${lastResult.message}`);
    }

    return lastResult;
  }
}

let checkerInstance: ClusterResourceChecker | null = null;

export function getClusterResourceChecker(): ClusterResourceChecker {
  if (!checkerInstance) {
    checkerInstance = new ClusterResourceChecker();
  }
  return checkerInstance;
}

export async function waitForClusterResources(
  options: WaitForResourcesOptions = {},
): Promise<ResourceCheckResult> {
  const checker = getClusterResourceChecker();
  return checker.waitForResources(options);
}

/**
 * Check for stale resources and clean them up.
 * This can be called independently to just clean up without waiting for thresholds.
 */
export async function cleanupStaleClusterResources(
  options: Partial<StaleResourceConfig> = {},
  verbose = false,
): Promise<string[]> {
  const checker = getClusterResourceChecker();
  const config: Required<StaleResourceConfig> = { ...DEFAULT_STALE_CONFIG, ...options };

  const initialized = await checker.initialize();
  if (!initialized) {
    return [];
  }

  const [staleVMs, staleVMIs] = await Promise.all([
    checker.detectStaleVMs(config),
    checker.detectStaleVMIs(config),
  ]);

  const staleResources = [...staleVMs, ...staleVMIs];

  if (staleResources.length === 0) {
    if (verbose) {
      logger.info('[StaleCleanup] No stale resources found');
    }
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

/**
 * Wait for the test namespace to be ready before running tests.
 * If namespace doesn't exist, creates it (defensive approach for parallel runs).
 *
 * @param namespace - The namespace to wait for (defaults to test namespace from config)
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 30000)
 * @param verbose - Whether to log progress (default: false)
 * @returns True if namespace is ready, false if timeout reached
 */
export async function waitForNamespaceReady(
  namespace?: string,
  timeoutMs = 30000,
  verbose = false,
): Promise<boolean> {
  const config = TestConfigManager.getConfig();
  const ns = namespace || config.testNamespace || EnvVariables.testNamespace;

  if (!ns) {
    if (verbose) {
      logger.warn('[NamespaceCheck] No namespace configured, skipping check');
    }
    return true;
  }

  const checker = getClusterResourceChecker();
  const initialized = await checker.initialize();

  if (!initialized) {
    if (verbose) {
      logger.warn('[NamespaceCheck] Could not initialize k8s client, skipping check');
    }
    return true; // Assume OK if we can't check
  }

  const startTime = Date.now();
  const intervalMs = 1000;
  let attemptedCreate = false;

  if (verbose) {
    logger.info(`[NamespaceCheck] Waiting for namespace '${ns}' to be ready...`);
  }

  while (Date.now() - startTime < timeoutMs) {
    try {
      const coreApi = checker.getCoreV1Api();
      const nsResponse = await coreApi.readNamespace({ name: ns });

      if (nsResponse.status?.phase === 'Active') {
        if (verbose) {
          logger.info(`[NamespaceCheck] Namespace '${ns}' is ready`);
        }
        return true;
      }
    } catch (error: unknown) {
      // Check if namespace doesn't exist (404)
      const errMsg = getErrorMessage(error).toLowerCase();
      const { statusCode, code, bodyCode } = readKubeClientErrorParts(error);
      const is404 =
        statusCode === 404 ||
        code === 404 ||
        bodyCode === 404 ||
        errMsg.includes('404') ||
        errMsg.includes('not found');

      if (is404 && !attemptedCreate) {
        // Namespace doesn't exist - try to create it (defensive for race conditions)
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
          if (verbose) {
            logger.info(`[NamespaceCheck] Created namespace '${ns}'`);
          }
        } catch (createError: unknown) {
          // Ignore 409 (already exists) - race condition with global setup
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
