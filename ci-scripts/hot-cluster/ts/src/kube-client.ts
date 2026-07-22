/**
 * KubeClient -- thin wrapper around @kubernetes/client-node with:
 *   - Automatic ServiceAccount token refresh (re-reads token file every 50min)
 *   - Retry with exponential backoff (409, 429, 503)
 *   - waitForCondition() -- generic poller replacing `oc wait`
 *   - bulkDelete() -- delete multiple resource types by label selector
 */

import { readFileSync } from 'node:fs';

import * as k8s from '@kubernetes/client-node';

const SA_TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';
const TOKEN_REFRESH_MS = 50 * 60 * 1000;

const RETRYABLE_STATUS_CODES = new Set([409, 429, 503]);
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

export class KubeClient {
  readonly kc: k8s.KubeConfig;
  private tokenRefreshTimer: ReturnType<typeof setInterval> | null = null;

  private constructor(kc: k8s.KubeConfig) {
    this.kc = kc;
  }

  static fromCluster(): KubeClient {
    const kc = new k8s.KubeConfig();
    kc.loadFromCluster();
    const client = new KubeClient(kc);
    client.startTokenRefresh();
    return client;
  }

  static fromKubeconfig(path?: string): KubeClient {
    const kc = new k8s.KubeConfig();
    if (path) {
      kc.loadFromFile(path);
    } else {
      kc.loadFromDefault();
    }
    return new KubeClient(kc);
  }

  static fromConfig(kc: k8s.KubeConfig): KubeClient {
    return new KubeClient(kc);
  }

  get coreV1(): k8s.CoreV1Api {
    return this.kc.makeApiClient(k8s.CoreV1Api);
  }

  get appsV1(): k8s.AppsV1Api {
    return this.kc.makeApiClient(k8s.AppsV1Api);
  }

  get customObjects(): k8s.CustomObjectsApi {
    return this.kc.makeApiClient(k8s.CustomObjectsApi);
  }

  dispose(): void {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  private startTokenRefresh(): void {
    this.tokenRefreshTimer = setInterval(() => {
      try {
        const token = readFileSync(SA_TOKEN_PATH, 'utf8').trim();
        const users = this.kc.getUsers();
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

  /**
   * Wait for a custom resource to reach a specific condition.
   * Replaces `oc wait --for=condition=X --timeout=Y`.
   */
  async waitForCondition(params: {
    group: string;
    version: string;
    plural: string;
    name: string;
    namespace?: string;
    conditionType: string;
    timeoutMs: number;
    pollIntervalMs?: number;
  }): Promise<void> {
    const { group, version, plural, name, namespace, conditionType, timeoutMs, pollIntervalMs = 5000 } = params;
    const deadline = Date.now() + timeoutMs;
    const api = this.customObjects;

    while (Date.now() < deadline) {
      try {
        const result = namespace
          ? await api.getNamespacedCustomObject({ group, version, namespace, plural, name })
          : await api.getClusterCustomObject({ group, version, plural, name });

        const obj = result as unknown as { status?: { conditions?: Array<{ type: string; status: string }> } };
        const condition = obj.status?.conditions?.find((c) => c.type === conditionType);

        if (condition?.status === 'True') return;
      } catch (err) {
        if (!isRetryableError(err)) throw err;
      }

      await sleep(Math.min(pollIntervalMs, deadline - Date.now()));
    }

    throw new Error(
      `Timed out waiting for ${group}/${version} ${plural}/${name}${namespace ? ` in ${namespace}` : ''} condition=${conditionType} (${timeoutMs}ms)`,
    );
  }

  /**
   * Delete all resources of multiple types in a namespace.
   * Replaces `oc delete vm,vmi,dv,pvc --all -n $NS`.
   */
  async bulkDelete(params: {
    namespace: string;
    resources: Array<{ group: string; version: string; plural: string }>;
    labelSelector?: string;
  }): Promise<number> {
    const { namespace, resources, labelSelector } = params;
    let deleted = 0;

    for (const { group, version, plural } of resources) {
      try {
        if (group === '' && version === 'v1') {
          const coreApi = this.coreV1;
          const opts = { namespace, labelSelector };

          switch (plural) {
            case 'pods':
              await coreApi.deleteCollectionNamespacedPod(opts);
              break;
            case 'services':
              await coreApi.deleteCollectionNamespacedService(opts);
              break;
            case 'configmaps':
              await coreApi.deleteCollectionNamespacedConfigMap(opts);
              break;
            case 'persistentvolumeclaims':
              await coreApi.deleteCollectionNamespacedPersistentVolumeClaim(opts);
              break;
            case 'secrets':
              await coreApi.deleteCollectionNamespacedSecret(opts);
              break;
            default:
              console.warn(`Unsupported core resource for bulk delete: ${plural}`);
              continue;
          }
        } else {
          await this.customObjects.deleteCollectionNamespacedCustomObject({
            group,
            version,
            namespace,
            plural,
          });
        }
        deleted++;
      } catch (err) {
        if ((err as { statusCode?: number }).statusCode === 404) continue;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`Failed to delete ${group}/${version}/${plural} in ${namespace}: ${msg}`);
      }
    }

    return deleted;
  }
}

/** Retry a function with exponential backoff on retryable HTTP status codes. */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  label = 'API call',
  maxRetries = MAX_RETRIES,
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries || !isRetryableError(err)) throw err;

      const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500;
      const statusCode = (err as { statusCode?: number }).statusCode ?? 'unknown';
      console.warn(`${label}: retryable error (status ${statusCode}), attempt ${attempt + 1}/${maxRetries}, retrying in ${Math.round(delay)}ms`);
      await sleep(delay);
    }
  }
  throw new Error('Unreachable');
};

const isRetryableError = (err: unknown): boolean => {
  const status = (err as { statusCode?: number }).statusCode;
  return typeof status === 'number' && RETRYABLE_STATUS_CODES.has(status);
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};
