import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';

import type { ProxyApiContext } from './proxy-api-context';

/**
 * Console-proxy handler for VM snapshot/restore resources and storage volume snapshots.
 *
 * Access via `apiClient.snapshot.*`
 */
export class SnapshotProxyHandler {
  constructor(private readonly ctx: ProxyApiContext) {}

  // ---------------------------------------------------------------------------
  // VirtualMachineSnapshots (snapshot.kubevirt.io/v1beta1)
  // ---------------------------------------------------------------------------

  create(namespace: string, spec: KubernetesResource): Promise<KubernetesResource | null> {
    return this.ctx.createResource(
      'snapshot.kubevirt.io',
      'v1beta1',
      'virtualmachinesnapshots',
      spec,
      namespace,
    );
  }

  createRestore(namespace: string, spec: KubernetesResource): Promise<KubernetesResource | null> {
    return this.ctx.createResource(
      'snapshot.kubevirt.io',
      'v1beta1',
      'virtualmachinerestores',
      spec,
      namespace,
    );
  }

  delete(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource(
      'snapshot.kubevirt.io',
      'v1beta1',
      'virtualmachinesnapshots',
      name,
      namespace,
    );
  }

  deleteRestore(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource(
      'snapshot.kubevirt.io',
      'v1beta1',
      'virtualmachinerestores',
      name,
      namespace,
    );
  }

  get(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource(
      'snapshot.kubevirt.io',
      'v1beta1',
      'virtualmachinesnapshots',
      name,
      namespace,
    );
  }

  getRestore(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource(
      'snapshot.kubevirt.io',
      'v1beta1',
      'virtualmachinerestores',
      name,
      namespace,
    );
  }

  // ---------------------------------------------------------------------------
  // VirtualMachineRestores (snapshot.kubevirt.io/v1beta1)
  // ---------------------------------------------------------------------------

  list(namespace: string, queryParams?: Record<string, string>): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      'snapshot.kubevirt.io',
      'v1beta1',
      'virtualmachinesnapshots',
      namespace,
      { limit: '250', ...queryParams },
    );
  }

  listRestores(
    namespace: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      'snapshot.kubevirt.io',
      'v1beta1',
      'virtualmachinerestores',
      namespace,
      { limit: '250', ...queryParams },
    );
  }

  listVolumeSnapshots(
    namespace: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources('snapshot.storage.k8s.io', 'v1', 'volumesnapshots', namespace, {
      limit: '250',
      ...queryParams,
    });
  }

  mergePatch(
    namespace: string,
    name: string,
    patch: Record<string, unknown>,
  ): Promise<KubernetesResource | null> {
    return this.ctx.mergePatchResource(
      'snapshot.kubevirt.io',
      'v1beta1',
      'virtualmachinesnapshots',
      name,
      patch,
      namespace,
    );
  }

  // ---------------------------------------------------------------------------
  // VolumeSnapshots (snapshot.storage.k8s.io/v1)
  // ---------------------------------------------------------------------------

  patch(namespace: string, name: string, patch: JsonPatchOp[]): Promise<KubernetesResource | null> {
    return this.ctx.patchResource(
      'snapshot.kubevirt.io',
      'v1beta1',
      'virtualmachinesnapshots',
      name,
      patch,
      namespace,
    );
  }
}
