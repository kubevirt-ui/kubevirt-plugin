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

  // ---------------------------------------------------------------------------
  // Storage Migration Plans (migrations.kubevirt.io/v1alpha1)
  // ---------------------------------------------------------------------------

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

  getStorageMigrationPlan(name: string, namespace: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource(
      InfraProxyHandler._MIGRATION_GROUP,
      InfraProxyHandler._MIGRATION_VERSION,
      InfraProxyHandler._MIGRATION_PLAN_PLURAL,
      name,
      namespace,
    );
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

  // ---------------------------------------------------------------------------
  // Network Attachment Definitions (k8s.cni.cncf.io/v1)
  // ---------------------------------------------------------------------------

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
}
