/**
 * ClusterJanitor — native in-process replacement for the k8s-healer binary.
 *
 * Performs the same stale-resource and stale-namespace cleanup as k8s-healer
 * using the RequestContextClient, without requiring an external process.
 *
 * Cleanup scope mirrors k8s-healer defaults:
 *   - Namespaced KubeVirt/CDI/snapshot/networking/template CRDs in pw-* namespaces
 *   - Cluster-scoped instance types, preferences, and migration policies with pw- prefix
 *   - pw-* namespaces older than staleAgeMs (excluding the primary test namespace)
 *
 * Stale detection mirrors IsCRDResourceStale from k8s-healer's pkg/util/checks.go:
 *   1. Age > staleAgeMs
 *   2. deletionTimestamp set for > staleAgeMs (stuck in Terminating) → strip finalizers first
 *   3. status.conditions[] contains an Error/Failed/Failure/Degraded type True for > 5 min
 *   4. status.phase or status.printableStatus is a failed/error value
 *
 * All errors are caught and logged as warnings — never thrown.
 */

import type RequestContextClient from '@/clients/request-context-client';
import type { JsonPatchOp } from '@/data-models/kubernetes-types';
import { logger } from '@/utils/logger';

// ── Types ──────────────────────────────────────────────────────────────────────

interface UnstructuredMeta {
  name?: string;
  namespace?: string;
  creationTimestamp?: string;
  deletionTimestamp?: string;
  finalizers?: string[];
}

interface UnstructuredResource {
  metadata?: UnstructuredMeta;
  status?: Record<string, unknown>;
}

export interface ClusterJanitorConfig {
  /** Age in ms after which a resource is considered stale. Default: 600 000 (10 min). */
  readonly staleAgeMs: number;
  /** Namespaces never deleted, even if they match pw-* and are old enough. */
  readonly excludeNamespaces: readonly string[];
}

// ── Resource type definitions ─────────────────────────────────────────────────

interface NamespacedResourceKind {
  readonly kind: string;
}

interface ClusterResourceKind {
  readonly kind: string;
  /** Prefixes that identify test-owned resources for cluster-scoped cleanup. */
  readonly testPrefixes: readonly string[];
}

const NAMESPACED_RESOURCE_KINDS: readonly NamespacedResourceKind[] = [
  { kind: 'vm' },
  { kind: 'vmi' },
  { kind: 'vmim' },
  { kind: 'datavolume' },
  { kind: 'datasource' },
  { kind: 'dataimportcron' },
  { kind: 'VirtualMachineSnapshot' },
  { kind: 'VirtualMachineClone' },
  { kind: 'VirtualMachineInstancetype' },
  { kind: 'VirtualMachinePreference' },
  { kind: 'net-attach-def' },
  { kind: 'UserDefinedNetwork' },
  { kind: 'template' },
  { kind: 'VirtualMachineTemplate' },
  { kind: 'VirtualMachineStorageMigrationPlan' },
  { kind: 'secret' },
  { kind: 'configmap' },
  { kind: 'pvc' },
  { kind: 'service' },
];

const CLUSTER_RESOURCE_KINDS: readonly ClusterResourceKind[] = [
  { kind: 'VirtualMachineClusterInstancetype', testPrefixes: ['pw-'] },
  { kind: 'VirtualMachineClusterPreference', testPrefixes: ['pw-'] },
  { kind: 'migrationpolicy', testPrefixes: ['pw-'] },
  { kind: 'MultiNamespaceVirtualMachineStorageMigrationPlan', testPrefixes: ['pw-'] },
];

// ── Stale detection ───────────────────────────────────────────────────────────

const ERROR_CONDITION_TYPES = ['Error', 'Failed', 'Failure', 'Degraded'];
const ERROR_PHASES = ['Failed', 'Error', 'Terminated', 'Terminating'];
const ERROR_PRINTABLE_STATUSES = [
  'Error',
  'ErrorUnschedulable',
  'ErrorPvcNotFound',
  'ErrorDataVolumeNotFound',
];
const ERROR_CONDITION_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function hasErrorConditions(status: Record<string, unknown>): boolean {
  const conditions = status['conditions'];
  if (!Array.isArray(conditions)) return false;

  for (const condition of conditions) {
    if (typeof condition !== 'object' || condition === null) continue;
    const c = condition as Record<string, unknown>;
    const type = typeof c['type'] === 'string' ? c['type'] : '';
    const condStatus = typeof c['status'] === 'string' ? c['status'] : '';

    if (condStatus !== 'True') continue;
    if (!ERROR_CONDITION_TYPES.some((t) => type.includes(t))) continue;

    const lastTransition = parseDate(c['lastTransitionTime']);
    if (lastTransition && Date.now() - lastTransition.getTime() > ERROR_CONDITION_THRESHOLD_MS) {
      return true;
    }
  }
  return false;
}

function hasFailedPhase(status: Record<string, unknown>): boolean {
  const phase = typeof status['phase'] === 'string' ? status['phase'] : '';
  if (phase && ERROR_PHASES.includes(phase)) return true;

  const printable = typeof status['printableStatus'] === 'string' ? status['printableStatus'] : '';
  return !!(printable && ERROR_PRINTABLE_STATUSES.includes(printable));
}

function isStale(resource: UnstructuredResource, staleAgeMs: number): boolean {
  const meta = resource.metadata ?? {};
  const now = Date.now();

  // 1. Stuck in Terminating for longer than staleAgeMs
  const deletionTs = parseDate(meta.deletionTimestamp);
  if (deletionTs && now - deletionTs.getTime() > staleAgeMs) {
    return true;
  }

  // 2. Older than staleAgeMs
  const creationTs = parseDate(meta.creationTimestamp);
  if (creationTs && now - creationTs.getTime() > staleAgeMs) {
    return true;
  }

  // 3. Error conditions or failed phase
  if (resource.status) {
    if (hasErrorConditions(resource.status)) return true;
    if (hasFailedPhase(resource.status)) return true;
  }

  return false;
}

function isStuckTerminating(resource: UnstructuredResource, staleAgeMs: number): boolean {
  const deletionTs = parseDate(resource.metadata?.deletionTimestamp);
  return !!(deletionTs && Date.now() - deletionTs.getTime() > staleAgeMs);
}

function extractHttpStatus(err: unknown): number | null {
  if (typeof err === 'object' && err !== null) {
    const code = (err as Record<string, unknown>)['statusCode'];
    if (typeof code === 'number') return code;
  }
  const msg = err instanceof Error ? err.message : String(err);
  const match = /HTTP-Code:\s*(\d{3})/.exec(msg);
  if (match) return parseInt(match[1], 10);
  const notFoundMatch = /not found|NotFound|404/.test(msg);
  if (notFoundMatch) return 404;
  return null;
}

// ── ClusterJanitor ────────────────────────────────────────────────────────────

export class ClusterJanitor {
  private readonly _client: RequestContextClient;
  private readonly _config: ClusterJanitorConfig;
  private _intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(client: RequestContextClient, config: Partial<ClusterJanitorConfig> = {}) {
    this._client = client;
    this._config = {
      staleAgeMs: config.staleAgeMs ?? 600_000,
      excludeNamespaces: config.excludeNamespaces ?? [],
    };
  }

  private async _clearNamespaceFinalizers(namespace: string): Promise<void> {
    for (const resourceKind of NAMESPACED_RESOURCE_KINDS) {
      let resources: UnstructuredResource[];
      try {
        const result = await this._client.listResourcesByKind(resourceKind.kind, namespace);
        resources = (result.items ?? []) as UnstructuredResource[];
      } catch {
        continue;
      }
      for (const resource of resources) {
        const name = resource.metadata?.name;
        const finalizers = resource.metadata?.finalizers;
        if (!name || !finalizers?.length) continue;
        await this._stripFinalizers(resourceKind.kind, name, namespace);
      }
    }
  }

  private async _deleteClusterResource(kind: string, name: string): Promise<void> {
    try {
      await this._client.deleteResourceByKind(kind, name);
    } catch (err: unknown) {
      if (extractHttpStatus(err) === 404) return;
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`[ClusterJanitor] failed to delete cluster ${kind}/${name} (non-fatal): ${msg}`);
    }
  }

  private async _deleteNamespacedResource(
    kind: string,
    name: string,
    namespace: string,
  ): Promise<void> {
    try {
      await this._client.deleteResourceByKind(kind, name, namespace);
    } catch (err: unknown) {
      if (extractHttpStatus(err) === 404) return;
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(
        `[ClusterJanitor] failed to delete ${kind}/${name} in ${namespace} (non-fatal): ${msg}`,
      );
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private async _discoverTestNamespaces(): Promise<string[]> {
    try {
      const nsList = await this._client.listResourcesByKind('namespace');
      const names = (nsList.items ?? [])
        .map((ns) => ns.metadata?.name)
        .filter((n): n is string => !!n && n.startsWith('pw-'));
      return names.filter((ns) => !this._config.excludeNamespaces.includes(ns));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`[ClusterJanitor] failed to list namespaces (non-fatal): ${msg}`);
      return [];
    }
  }

  private async _maybeDeleteNamespace(name: string): Promise<void> {
    let nsResource: {
      metadata?: { creationTimestamp?: string; deletionTimestamp?: string };
    };
    try {
      const raw = await this._client.getResourceByKind('namespace', name);
      if (!raw) return;
      nsResource = raw as typeof nsResource;
    } catch {
      return;
    }

    const isTerminating = !!nsResource.metadata?.deletionTimestamp;

    if (!isTerminating) {
      const creationTs = parseDate(nsResource.metadata?.creationTimestamp);
      if (!creationTs) return;
      if (Date.now() - creationTs.getTime() < this._config.staleAgeMs) return;

      try {
        await this._client.deleteResourceByKind('namespace', name);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.warn(`[ClusterJanitor] failed to delete namespace ${name} (non-fatal): ${msg}`);
      }
    }

    // Namespace is stuck in Terminating — strip finalizers on lingering sub-resources
    // so the API server can complete the deletion.
    await this._clearNamespaceFinalizers(name);
  }

  private async _stripClusterFinalizers(kind: string, name: string): Promise<void> {
    try {
      const patchOps: JsonPatchOp[] = [{ op: 'replace', path: '/metadata/finalizers', value: [] }];
      await this._client.patchResourceByKind(kind, name, patchOps, undefined, 'json');
    } catch (err: unknown) {
      const status = extractHttpStatus(err);
      if (status === 400 || status === 404 || status === 409) return;
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(
        `[ClusterJanitor] failed to strip finalizers from cluster ${kind}/${name} (non-fatal): ${msg}`,
      );
    }
  }

  private async _stripFinalizers(kind: string, name: string, namespace: string): Promise<void> {
    try {
      const patchOps: JsonPatchOp[] = [{ op: 'replace', path: '/metadata/finalizers', value: [] }];
      await this._client.patchResourceByKind(kind, name, patchOps, namespace, 'json');
    } catch (err: unknown) {
      const status = extractHttpStatus(err);
      if (status === 400 || status === 404 || status === 409) return;
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(
        `[ClusterJanitor] failed to strip finalizers from ${kind}/${name} (non-fatal): ${msg}`,
      );
    }
  }

  private async _sweepClusterResourceKind(resourceKind: ClusterResourceKind): Promise<void> {
    let resources: UnstructuredResource[];
    try {
      const result = await this._client.listResourcesByKind(resourceKind.kind);
      resources = (result.items ?? []) as UnstructuredResource[];
    } catch {
      return;
    }

    for (const resource of resources) {
      const name = resource.metadata?.name;
      if (!name) continue;

      // Only touch resources that match a test prefix
      if (!resourceKind.testPrefixes.some((prefix) => name.startsWith(prefix))) continue;

      if (!isStale(resource, this._config.staleAgeMs)) continue;

      if (isStuckTerminating(resource, this._config.staleAgeMs)) {
        await this._stripClusterFinalizers(resourceKind.kind, name);
      }

      await this._deleteClusterResource(resourceKind.kind, name);
    }
  }

  private async _sweepClusterResources(): Promise<void> {
    for (const resourceKind of CLUSTER_RESOURCE_KINDS) {
      await this._sweepClusterResourceKind(resourceKind);
    }
  }

  private async _sweepNamespacedResourceKind(
    namespace: string,
    resourceKind: NamespacedResourceKind,
  ): Promise<void> {
    let resources: UnstructuredResource[];
    try {
      const result = await this._client.listResourcesByKind(resourceKind.kind, namespace);
      resources = (result.items ?? []) as UnstructuredResource[];
    } catch {
      // CRD may not be installed on this cluster — skip silently
      return;
    }

    for (const resource of resources) {
      const name = resource.metadata?.name;
      if (!name) continue;

      if (!isStale(resource, this._config.staleAgeMs)) continue;

      // Strip finalizers first if stuck in Terminating
      if (isStuckTerminating(resource, this._config.staleAgeMs)) {
        await this._stripFinalizers(resourceKind.kind, name, namespace);
      }

      await this._deleteNamespacedResource(resourceKind.kind, name, namespace);
    }
  }

  private async _sweepNamespacedResources(namespaces: string[]): Promise<void> {
    for (const ns of namespaces) {
      for (const resourceKind of NAMESPACED_RESOURCE_KINDS) {
        await this._sweepNamespacedResourceKind(ns, resourceKind);
      }
    }
  }

  /**
   * Sweep pw-prefixed CRDs that live outside pw-* namespaces — e.g. the primary test namespace
   * (pw-test-ns, pw-e2e-tests, etc.), the UDN namespace, or any other non-pw-* namespace used
   * by tests. These resources follow the pw- naming convention but would be missed by
   * _sweepNamespacedResources which only iterates over discovered pw-* namespaces.
   * Note: excludeNamespaces only prevents namespace deletion — stale pw-prefixed CRDs inside
   * those namespaces are still eligible for cleanup here.
   */
  private async _sweepPwPrefixedResourcesOutsideTestNamespaces(
    testNamespaces: string[],
  ): Promise<void> {
    const testNamespaceSet = new Set(testNamespaces);

    for (const resourceKind of NAMESPACED_RESOURCE_KINDS) {
      let allResources: UnstructuredResource[];
      try {
        // listResourcesByKind with undefined namespace returns all instances across every namespace
        const result = await this._client.listResourcesByKind(resourceKind.kind);
        allResources = (result.items ?? []) as UnstructuredResource[];
      } catch {
        // CRD not installed or no cluster-wide list permission — skip silently
        continue;
      }

      for (const resource of allResources) {
        const name = resource.metadata?.name;
        const namespace = resource.metadata?.namespace;
        if (!name || !namespace) continue;

        // Only target pw-prefixed resources in non-pw-* namespaces
        // (pw-* namespaces are already swept by _sweepNamespacedResources)
        if (!name.startsWith('pw-')) continue;
        if (testNamespaceSet.has(namespace)) continue;

        if (!isStale(resource, this._config.staleAgeMs)) continue;

        if (isStuckTerminating(resource, this._config.staleAgeMs)) {
          await this._stripFinalizers(resourceKind.kind, name, namespace);
        }

        await this._deleteNamespacedResource(resourceKind.kind, name, namespace);
      }
    }
  }

  private async _sweepStaleNamespaces(namespaces: string[]): Promise<void> {
    for (const ns of namespaces) {
      await this._maybeDeleteNamespace(ns);
    }
  }

  /**
   * Start a background interval that calls sweepOnce() every intervalMs milliseconds.
   * Call stop() to cancel the interval.
   */
  public startInterval(intervalMs: number): void {
    if (this._intervalHandle !== null) return;
    this._intervalHandle = setInterval(() => {
      this.sweepOnce().catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        logger.warn(`[ClusterJanitor] background sweep error (non-fatal): ${msg}`);
      });
    }, intervalMs);
    // Allow the Node.js process to exit even if the interval is still pending
    if (this._intervalHandle && typeof this._intervalHandle === 'object') {
      (this._intervalHandle as unknown as { unref?: () => void }).unref?.();
    }
  }

  /** Stop the background interval. */
  public stop(): void {
    if (this._intervalHandle !== null) {
      clearInterval(this._intervalHandle);
      this._intervalHandle = null;
    }
  }

  /**
   * Perform a single cleanup sweep:
   *   1. Discover all pw-* namespaces (excluding configured exclusions)
   *   2. For each namespace, delete stale namespaced CRDs
   *   3. Delete stale pw-prefixed CRDs in non-pw-* namespaces (e.g. primary test ns, UDN ns)
   *   4. Delete stale cluster-scoped test resources
   *   5. Delete stale pw-* namespaces
   */
  public async sweepOnce(): Promise<void> {
    const namespaces = await this._discoverTestNamespaces();

    await this._sweepNamespacedResources(namespaces);
    await this._sweepPwPrefixedResourcesOutsideTestNamespaces(namespaces);
    await this._sweepClusterResources();
    await this._sweepStaleNamespaces(namespaces);
  }
}
