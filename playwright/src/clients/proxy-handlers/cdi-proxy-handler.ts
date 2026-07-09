import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';

import type { ProxyApiContext } from './proxy-api-context';

/**
 * Console-proxy handler for CDI resources (cdi.kubevirt.io/v1beta1):
 * DataVolumes, DataSources, DataImportCrons, CDIConfig, and StorageProfiles.
 *
 * Access via `apiClient.cdi.*`
 */
export class CdiProxyHandler {
  constructor(private readonly ctx: ProxyApiContext) {}

  // ---------------------------------------------------------------------------
  // DataVolumes
  // ---------------------------------------------------------------------------

  createDataSource(
    namespace: string,
    spec: KubernetesResource,
  ): Promise<KubernetesResource | null> {
    return this.ctx.createResource('cdi.kubevirt.io', 'v1beta1', 'datasources', spec, namespace);
  }

  createDataVolume(
    namespace: string,
    spec: KubernetesResource,
  ): Promise<KubernetesResource | null> {
    return this.ctx.createResource('cdi.kubevirt.io', 'v1beta1', 'datavolumes', spec, namespace);
  }

  deleteDataSource(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource('cdi.kubevirt.io', 'v1beta1', 'datasources', name, namespace);
  }

  deleteDataVolume(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource('cdi.kubevirt.io', 'v1beta1', 'datavolumes', name, namespace);
  }

  getCdiConfig(): Promise<KubernetesResource | null> {
    return this.ctx.getResource('cdi.kubevirt.io', 'v1beta1', 'cdiconfigs', 'config');
  }

  // ---------------------------------------------------------------------------
  // DataSources
  // ---------------------------------------------------------------------------

  getDataSource(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource('cdi.kubevirt.io', 'v1beta1', 'datasources', name, namespace);
  }

  getDataVolume(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource('cdi.kubevirt.io', 'v1beta1', 'datavolumes', name, namespace);
  }

  listDataImportCrons(
    namespace?: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources('cdi.kubevirt.io', 'v1beta1', 'dataimportcrons', namespace, {
      limit: '250',
      ...queryParams,
    });
  }

  listDataSources(namespace?: string, labelSelector?: string): Promise<KubernetesListResource> {
    const queryParams: Record<string, string> = { limit: '250' };
    if (labelSelector) queryParams.labelSelector = labelSelector;
    return this.ctx.listResources(
      'cdi.kubevirt.io',
      'v1beta1',
      'datasources',
      namespace,
      queryParams,
    );
  }

  listDataVolumes(
    namespace?: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources('cdi.kubevirt.io', 'v1beta1', 'datavolumes', namespace, {
      limit: '250',
      ...queryParams,
    });
  }

  // ---------------------------------------------------------------------------
  // DataImportCrons
  // ---------------------------------------------------------------------------

  listStorageProfiles(queryParams?: Record<string, string>): Promise<KubernetesListResource> {
    return this.ctx.listResources('cdi.kubevirt.io', 'v1beta1', 'storageprofiles', undefined, {
      limit: '250',
      ...queryParams,
    });
  }

  // ---------------------------------------------------------------------------
  // CDIConfig (cluster-scoped singleton)
  // ---------------------------------------------------------------------------

  patchDataSource(
    namespace: string,
    name: string,
    patch: JsonPatchOp[],
  ): Promise<KubernetesResource | null> {
    return this.ctx.patchResource(
      'cdi.kubevirt.io',
      'v1beta1',
      'datasources',
      name,
      patch,
      namespace,
    );
  }

  // ---------------------------------------------------------------------------
  // StorageProfiles (cluster-scoped)
  // ---------------------------------------------------------------------------

  patchDataVolume(
    namespace: string,
    name: string,
    patch: JsonPatchOp[],
  ): Promise<KubernetesResource | null> {
    return this.ctx.patchResource(
      'cdi.kubevirt.io',
      'v1beta1',
      'datavolumes',
      name,
      patch,
      namespace,
    );
  }
}
