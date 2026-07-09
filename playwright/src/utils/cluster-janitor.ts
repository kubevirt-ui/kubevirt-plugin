import type { KubernetesClient } from '@/clients/kubernetes-client';

import { logger } from './logger';

export interface ClusterJanitorOptions {
  staleAgeMs: number;
  excludeNamespaces?: string[];
}

/**
 * Periodically sweeps stale pw-* test namespaces from the cluster.
 * Runs as a background interval during test execution.
 */
export class ClusterJanitor {
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly k8sClient: KubernetesClient,
    private readonly options: ClusterJanitorOptions,
  ) {}

  startInterval(intervalMs: number): void {
    if (this.intervalHandle) return;
    this.intervalHandle = setInterval(() => {
      this.sweepOnce().catch((err) => {
        logger.warn(`ClusterJanitor sweep error: ${err}`);
      });
    }, intervalMs);
  }

  stopInterval(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async sweepOnce(): Promise<void> {
    try {
      const coreApi = this.k8sClient.getCoreV1Api();
      const namespaces = await coreApi.listNamespace();
      const now = Date.now();
      const excludeSet = new Set(this.options.excludeNamespaces || []);

      for (const ns of namespaces.items || []) {
        const name = ns.metadata?.name;
        if (!name || !name.startsWith('pw-') || excludeSet.has(name)) continue;

        const creationTimestamp = ns.metadata?.creationTimestamp;
        if (!creationTimestamp) continue;

        const ageMs = now - new Date(creationTimestamp).getTime();
        if (ageMs > this.options.staleAgeMs) {
          try {
            await coreApi.deleteNamespace({ name });
            logger.info(
              `🧹 ClusterJanitor: deleted stale namespace ${name} (age: ${Math.round(ageMs / 60_000)}min)`,
            );
          } catch {
            // Namespace may already be terminating
          }
        }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.warn(`ClusterJanitor sweep failed: ${msg}`);
    }
  }
}
