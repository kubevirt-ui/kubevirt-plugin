/** KubeClient -- @kubernetes/client-node wrapper with SA token refresh, retry, waitForCondition, bulkDelete. */

import { readFileSync } from 'node:fs';

import * as k8s from '@kubernetes/client-node';

import { bulkDeleteResources } from './bulk-delete';
import { isRetryableError } from './retry';
import { requireEnv, sleep } from './utils';

export { requireEnv, sleep };
export { withRetry } from './retry';

const SA_TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';
const TOKEN_REFRESH_MS = 50 * 60 * 1000;

export class KubeClient {
  private tokenRefreshTimer: null | ReturnType<typeof setInterval> = null;
  readonly kubeConfig: k8s.KubeConfig;

  private constructor(kubeConfig: k8s.KubeConfig) {
    this.kubeConfig = kubeConfig;
  }

  static fromCluster(): KubeClient {
    const kubeConfig = new k8s.KubeConfig();
    kubeConfig.loadFromCluster();
    const client = new KubeClient(kubeConfig);
    client.startTokenRefresh();
    return client;
  }

  static fromConfig(kubeConfig: k8s.KubeConfig): KubeClient {
    return new KubeClient(kubeConfig);
  }

  static fromKubeconfig(path?: string): KubeClient {
    const kubeConfig = new k8s.KubeConfig();
    if (path) {
      kubeConfig.loadFromFile(path);
    } else {
      kubeConfig.loadFromDefault();
    }
    return new KubeClient(kubeConfig);
  }

  private startTokenRefresh(): void {
    this.tokenRefreshTimer = setInterval(() => {
      try {
        const token = readFileSync(SA_TOKEN_PATH, 'utf8').trim();
        const users = this.kubeConfig.getUsers();
        if (users.length > 0) {
          (users[0] as { token?: string }).token = token;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`Token refresh failed: ${msg}`);
      }
    }, TOKEN_REFRESH_MS);

    if (this.tokenRefreshTimer.unref) {
      this.tokenRefreshTimer.unref();
    }
  }

  get appsV1(): k8s.AppsV1Api {
    return this.kubeConfig.makeApiClient(k8s.AppsV1Api);
  }

  async bulkDelete(params: {
    labelSelector?: string;
    namespace: string;
    resources: Array<{ group: string; plural: string; version: string }>;
  }): Promise<number> {
    return bulkDeleteResources(this.coreV1, this.customObjects, params);
  }

  get coreV1(): k8s.CoreV1Api {
    return this.kubeConfig.makeApiClient(k8s.CoreV1Api);
  }

  get customObjects(): k8s.CustomObjectsApi {
    return this.kubeConfig.makeApiClient(k8s.CustomObjectsApi);
  }

  dispose(): void {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Wait for a custom resource to reach a specific condition.
   * Replaces `oc wait --for=condition=X --timeout=Y`.
   */
  async waitForCondition(params: {
    conditionType: string;
    group: string;
    name: string;
    namespace?: string;
    plural: string;
    pollIntervalMs?: number;
    timeoutMs: number;
    version: string;
  }): Promise<void> {
    const {
      conditionType,
      group,
      name,
      namespace,
      plural,
      pollIntervalMs = 5000,
      timeoutMs,
      version,
    } = params;
    const deadline = Date.now() + timeoutMs;
    const api = this.customObjects;

    const poll = async (): Promise<void> => {
      if (Date.now() >= deadline) {
        const location = namespace ? ` in ${namespace}` : '';
        throw new Error(
          `Timed out waiting for ${group}/${version} ${plural}/${name}${location} condition=${conditionType} (${timeoutMs}ms)`,
        );
      }

      try {
        const result: unknown = namespace
          ? await api.getNamespacedCustomObject({ group, name, namespace, plural, version })
          : await api.getClusterCustomObject({ group, name, plural, version });

        const obj = result as unknown as {
          status?: { conditions?: Array<{ status: string; type: string }> };
        };
        const condition = obj.status?.conditions?.find((cond) => cond.type === conditionType);

        if (condition?.status === 'True') {
          return;
        }
      } catch (err) {
        if (!isRetryableError(err)) {
          throw err;
        }
      }

      await sleep(Math.min(pollIntervalMs, deadline - Date.now()));
      return poll();
    };

    return poll();
  }
}
