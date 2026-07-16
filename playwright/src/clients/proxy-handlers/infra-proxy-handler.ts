import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';

import type { ProxyApiContext } from './proxy-api-context';

/**
 * Console-proxy handler for KubeVirt infrastructure-level resources:
 * HyperConverged, KubeVirt CR, MigrationPolicies, StorageMigrationPlans,
 * Network Attachment Definitions, and the plugin health endpoint.
 *
 * Access via `apiClient.infra.*`
 */
export class InfraProxyHandler {
  private static readonly _MIGRATION_GROUP = 'migrations.kubevirt.io';

  // ---------------------------------------------------------------------------
  // HyperConverged (hco.kubevirt.io/v1beta1)
  // ---------------------------------------------------------------------------

  private static readonly _MIGRATION_PLAN_MULTI_NS =
    'multinamespacevirtualmachinestoragemigrationplans';

  private static readonly _MIGRATION_PLAN_PLURAL = 'virtualmachinestoragemigrationplans';

  private static readonly _MIGRATION_VERSION = 'v1alpha1';

  constructor(private readonly ctx: ProxyApiContext) {}

  // ---------------------------------------------------------------------------
  // KubeVirt CR (kubevirt.io/v1)
  // ---------------------------------------------------------------------------

  createMigrationPolicy(spec: KubernetesResource): Promise<KubernetesResource | null> {
    return this.ctx.createResource('migrations.kubevirt.io', 'v1alpha1', 'migrationpolicies', spec);
  }

  // ---------------------------------------------------------------------------
  // Migration Policies (migrations.kubevirt.io/v1alpha1)
  // ---------------------------------------------------------------------------

  createMultiNsStorageMigrationPlan(
    spec: KubernetesResource,
    namespace: string,
  ): Promise<KubernetesResource | null> {
    return this.ctx.createResource(
      InfraProxyHandler._MIGRATION_GROUP,
      InfraProxyHandler._MIGRATION_VERSION,
      InfraProxyHandler._MIGRATION_PLAN_MULTI_NS,
      spec,
      namespace,
    );
  }

  createStorageMigrationPlan(
    spec: KubernetesResource,
    namespace: string,
  ): Promise<KubernetesResource | null> {
    return this.ctx.createResource(
      InfraProxyHandler._MIGRATION_GROUP,
      InfraProxyHandler._MIGRATION_VERSION,
      InfraProxyHandler._MIGRATION_PLAN_PLURAL,
      spec,
      namespace,
    );
  }

  deleteMigrationPolicy(name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource('migrations.kubevirt.io', 'v1alpha1', 'migrationpolicies', name);
  }

  deleteMultiNsStorageMigrationPlan(
    name: string,
    namespace: string,
  ): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource(
      InfraProxyHandler._MIGRATION_GROUP,
      InfraProxyHandler._MIGRATION_VERSION,
      InfraProxyHandler._MIGRATION_PLAN_MULTI_NS,
      name,
      namespace,
    );
  }

  deleteStorageMigrationPlan(name: string, namespace: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource(
      InfraProxyHandler._MIGRATION_GROUP,
      InfraProxyHandler._MIGRATION_VERSION,
      InfraProxyHandler._MIGRATION_PLAN_PLURAL,
      name,
      namespace,
    );
  }

  getHyperConverged(
    namespace = 'openshift-cnv',
    name = 'kubevirt-hyperconverged',
  ): Promise<KubernetesResource | null> {
    return this.ctx.getResource('hco.kubevirt.io', 'v1beta1', 'hyperconvergeds', name, namespace);
  }

  getKubeVirt(
    namespace = 'openshift-cnv',
    name = 'kubevirt-kubevirt-hyperconverged',
  ): Promise<KubernetesResource | null> {
    return this.ctx.getResource('kubevirt.io', 'v1', 'kubevirts', name, namespace);
  }

  // ---------------------------------------------------------------------------
  // Storage Migration Plans (migrations.kubevirt.io/v1alpha1)
  // ---------------------------------------------------------------------------

  async getKubevirtPluginVersion(): Promise<string | undefined> {
    try {
      const plugin = await this.ctx.getResource(
        'console.openshift.io',
        'v1',
        'consoleplugins',
        'kubevirt-plugin',
      );
      const labels = plugin?.metadata?.labels as Record<string, string> | undefined;
      return labels?.['app.kubernetes.io/version'];
    } catch {
      return undefined;
    }
  }
  getMultiNsStorageMigrationPlan(
    name: string,
    namespace: string,
  ): Promise<KubernetesResource | null> {
    return this.ctx.getResource(
      InfraProxyHandler._MIGRATION_GROUP,
      InfraProxyHandler._MIGRATION_VERSION,
      InfraProxyHandler._MIGRATION_PLAN_MULTI_NS,
      name,
      namespace,
    );
  }
  async getNodeOsImage(): Promise<string | undefined> {
    const nodes = await this.ctx.listResources('', 'v1', 'nodes');
    const first = nodes?.items?.[0];
    const nodeInfo = (first?.status as Record<string, unknown>)?.nodeInfo as
      | Record<string, string>
      | undefined;
    return nodeInfo?.osImage;
  }
  async getReadyNodes(): Promise<KubernetesResource[]> {
    const nodes = await this.ctx.listResources('', 'v1', 'nodes');
    return (nodes?.items ?? []).filter((node) => {
      const conditions = (node.status as Record<string, unknown>)?.conditions as
        | Array<{ type: string; status: string }>
        | undefined;
      return conditions?.some((c) => c.type === 'Ready' && c.status === 'True');
    });
  }

  getStorageMigrationPlan(name: string, namespace: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource(
      InfraProxyHandler._MIGRATION_GROUP,
      InfraProxyHandler._MIGRATION_VERSION,
      InfraProxyHandler._MIGRATION_PLAN_PLURAL,
      name,
      namespace,
    );
  }

  async isNativeVmTemplateFeatureGateEnabled(
    namespace = 'openshift-cnv',
    kubevirtName = 'kubevirt-kubevirt-hyperconverged',
  ): Promise<boolean> {
    const kv = await this.getKubeVirt(namespace, kubevirtName);
    const spec = kv?.spec as Record<string, unknown> | undefined;
    const config = spec?.configuration as Record<string, unknown> | undefined;
    const devConfig = config?.developerConfiguration as Record<string, unknown> | undefined;
    const featureGates = (devConfig?.featureGates as string[]) ?? [];
    const disabledFeatureGates = (devConfig?.disabledFeatureGates as string[]) ?? [];
    return featureGates.includes('Template') && !disabledFeatureGates.includes('Template');
  }

  async isStorageMigrationAvailable(): Promise<boolean> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await this.ctx.listResources(
          InfraProxyHandler._MIGRATION_GROUP,
          InfraProxyHandler._MIGRATION_VERSION,
          InfraProxyHandler._MIGRATION_PLAN_PLURAL,
        );
        return true;
      } catch {
        if (attempt === 0) await new Promise((r) => setTimeout(r, 2_000));
      }
    }
    return false;
  }

  listHyperConvergeds(namespace = 'openshift-cnv'): Promise<KubernetesListResource> {
    return this.ctx.listResources('hco.kubevirt.io', 'v1beta1', 'hyperconvergeds', namespace, {
      limit: '250',
    });
  }

  listMigrationPolicies(queryParams?: Record<string, string>): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      'migrations.kubevirt.io',
      'v1alpha1',
      'migrationpolicies',
      undefined,
      { limit: '250', ...queryParams },
    );
  }

  /**
   * Lists namespaced VirtualMachineStorageMigrationPlan resources (child plans).
   * Created automatically when a MultiNamespace plan is applied.
   */
  listNamespacedStorageMigrationPlans(
    namespace: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      InfraProxyHandler._MIGRATION_GROUP,
      InfraProxyHandler._MIGRATION_VERSION,
      InfraProxyHandler._MIGRATION_PLAN_PLURAL,
      namespace,
      { limit: '250', ...queryParams },
    );
  }

  listNetworkAttachmentDefinitions(
    namespace: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      'k8s.cni.cncf.io',
      'v1',
      'network-attachment-definitions',
      namespace,
      { limit: '250', ...queryParams },
    );
  }

  /**
   * Lists MultiNamespaceVirtualMachineStorageMigrationPlan resources.
   * This is the CRD the UI uses on the "Storage migrations" page.
   */
  listStorageMigrationPlans(
    namespace?: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      InfraProxyHandler._MIGRATION_GROUP,
      InfraProxyHandler._MIGRATION_VERSION,
      InfraProxyHandler._MIGRATION_PLAN_MULTI_NS,
      namespace,
      { limit: '250', ...queryParams },
    );
  }

  async migrationPolicyExists(name: string): Promise<boolean> {
    try {
      const policy = await this.ctx.getResource(
        'migrations.kubevirt.io',
        'v1alpha1',
        'migrationpolicies',
        name,
      );
      return policy !== null;
    } catch {
      return false;
    }
  }

  patchHyperConverged(
    namespace = 'openshift-cnv',
    name = 'kubevirt-hyperconverged',
    patchPayload: JsonPatchOp[],
  ): Promise<KubernetesResource | null> {
    return this.ctx._request(
      'patch',
      `/kubernetes/apis/hco.kubevirt.io/v1beta1/namespaces/${namespace}/hyperconvergeds/${name}`,
      { data: patchPayload, headers: { 'Content-Type': 'application/json-patch+json' } },
    );
  }

  patchMigrationPolicy(name: string, patch: JsonPatchOp[]): Promise<KubernetesResource | null> {
    return this.ctx.patchResource(
      'migrations.kubevirt.io',
      'v1alpha1',
      'migrationpolicies',
      name,
      patch,
    );
  }

  setMemoryDensity(
    memoryOvercommitPercentage: number,
    namespace = 'openshift-cnv',
    name = 'kubevirt-hyperconverged',
  ): Promise<KubernetesResource | null> {
    return this.ctx.mergePatchResource(
      'hco.kubevirt.io',
      'v1beta1',
      'hyperconvergeds',
      name,
      { spec: { higherWorkloadDensity: { memoryOvercommitPercentage } } },
      namespace,
    );
  }

  async verifyAuthentication(): Promise<boolean> {
    try {
      await this.ctx.listResources('', 'v1', 'nodes');
      return true;
    } catch {
      return false;
    }
  }

  async verifyLiveMigrationLimits(
    expectedParallelMigrations: number,
    expectedPerCluster: number,
    namespace = 'openshift-cnv',
    kubevirtName = 'kubevirt-kubevirt-hyperconverged',
  ): Promise<{
    allMatch: boolean;
    actualParallelMigrations: number | null;
    actualPerCluster: number | null;
  }> {
    const kv = await this.getKubeVirt(namespace, kubevirtName);
    const spec = kv?.spec as Record<string, unknown> | undefined;
    const virt = spec?.virtualization as Record<string, unknown> | undefined;
    const config = virt?.liveMigrationConfig as Record<string, unknown> | undefined;
    const actualParallelMigrations: number | null =
      (config?.parallelMigrationsPerCluster as number) ?? null;
    const actualPerCluster: number | null =
      (config?.parallelOutboundMigrationsPerNode as number) ?? null;
    return {
      allMatch:
        actualParallelMigrations === expectedParallelMigrations &&
        actualPerCluster === expectedPerCluster,
      actualParallelMigrations,
      actualPerCluster,
    };
  }

  // ---------------------------------------------------------------------------
  // Network Attachment Definitions (k8s.cni.cncf.io/v1)
  // ---------------------------------------------------------------------------

  async verifyMigrationPolicyCreated(name: string, timeoutMs = 30000): Promise<boolean> {
    const interval = 2000;
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
      if (await this.migrationPolicyExists(name)) return true;
      await new Promise((r) => setTimeout(r, interval));
    }
    return false;
  }
}
