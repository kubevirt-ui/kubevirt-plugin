/**
 * Utility to check cluster resource utilization before running tests.
 * Helps prevent test failures by waiting for cluster resources to be below thresholds.
 * Also detects and cleans up stale resources (VMs stuck in problematic states).
 */

import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';
import type { V1VirtualMachine } from '@/data-models/kubevirt-types';
import * as k8s from '@kubernetes/client-node';

import type { StaleResource, StaleResourceConfig } from './cluster-namespace-utils';
import {
  cleanupStaleResource as cleanupStaleResourceUtil,
  cleanupStaleResources as cleanupStaleResourcesUtil,
  DEFAULT_STALE_CONFIG,
  detectStaleVMIs as detectStaleVMIsUtil,
  detectStaleVMs as detectStaleVMsUtil,
  withK8sRetry,
} from './cluster-namespace-utils';
import { EnvVariables } from './env-variables';
import { logger } from './logger';
import { TestConfigManager } from './test-config';

export type { StaleResource, StaleResourceConfig } from './cluster-namespace-utils';
export { cleanupStaleClusterResources, waitForNamespaceReady } from './cluster-namespace-utils';

export interface ResourceThresholds {
  maxRunningVms?: number;
  maxPendingPods?: number;
  maxVmis?: number;
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

const DEFAULT_OPTIONS: Required<
  Omit<WaitForResourcesOptions, 'staleResourceConfig' | 'thresholds'>
> = {
  timeout: 60000,
  interval: 5000,
  verbose: false,
};

export class ClusterResourceChecker {
  private kc: k8s.KubeConfig;
  private customObjectsApi: k8s.CustomObjectsApi;
  private coreApi: k8s.CoreV1Api;
  private namespace: string;
  private isInitialized = false;
  private backgroundCleanupPromise: null | Promise<void> = null;

  constructor() {
    this.kc = new k8s.KubeConfig();
    this.namespace = '';
    this.customObjectsApi = null as unknown as k8s.CustomObjectsApi;
    this.coreApi = null as unknown as k8s.CoreV1Api;
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

  async detectStaleVMs(config: Required<StaleResourceConfig>): Promise<StaleResource[]> {
    return detectStaleVMsUtil(this.customObjectsApi, this.namespace, config);
  }

  async detectStaleVMIs(config: Required<StaleResourceConfig>): Promise<StaleResource[]> {
    return detectStaleVMIsUtil(this.customObjectsApi, this.namespace, config);
  }

  async cleanupStaleResource(resource: StaleResource, verbose: boolean): Promise<boolean> {
    return cleanupStaleResourceUtil(this.customObjectsApi, resource, verbose);
  }

  async cleanupStaleResources(
    staleResources: StaleResource[],
    verbose: boolean,
  ): Promise<string[]> {
    return cleanupStaleResourcesUtil(this.customObjectsApi, staleResources, verbose);
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
        belowThreshold: true,
        runningVms: 0,
        pendingPods: 0,
        vmis: 0,
        message: 'Unable to initialize Kubernetes client, skipping resource check',
      };
    }

    try {
      let runningVms = 0;
      try {
        const rawList = await withK8sRetry(
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
          const typedVm = vm as unknown as V1VirtualMachine;
          return typedVm.status?.printableStatus === 'Running' || typedVm.spec?.running === true;
        }).length;
      } catch {
        runningVms = 0;
      }

      let vmis = 0;
      try {
        const rawVmis = await withK8sRetry(
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
        const podsResponse = await withK8sRetry(
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

  async waitForBackgroundCleanup(): Promise<void> {
    if (this.backgroundCleanupPromise) {
      await this.backgroundCleanupPromise;
      this.backgroundCleanupPromise = null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
