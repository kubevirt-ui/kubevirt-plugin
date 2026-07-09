import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';

import type { ProxyApiContext } from './proxy-api-context';

/**
 * Console-proxy handler for KubeVirt VirtualMachine, VirtualMachineInstance,
 * and VirtualMachineInstanceMigration resources.
 *
 * Access via `apiClient.vm.*`
 */
export class VirtualMachineProxyHandler {
  constructor(private readonly ctx: ProxyApiContext) {}

  // ---------------------------------------------------------------------------
  // VirtualMachines
  // ---------------------------------------------------------------------------

  create(namespace: string, spec: KubernetesResource): Promise<KubernetesResource | null> {
    return this.ctx.createResource('kubevirt.io', 'v1', 'virtualmachines', spec, namespace);
  }

  createMigration(namespace: string, spec: KubernetesResource): Promise<KubernetesResource | null> {
    return this.ctx.createResource(
      'kubevirt.io',
      'v1',
      'virtualmachineinstancemigrations',
      spec,
      namespace,
    );
  }

  delete(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource('kubevirt.io', 'v1', 'virtualmachines', name, namespace);
  }

  deleteMigration(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource(
      'kubevirt.io',
      'v1',
      'virtualmachineinstancemigrations',
      name,
      namespace,
    );
  }

  get(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource('kubevirt.io', 'v1', 'virtualmachines', name, namespace);
  }

  getInstance(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource('kubevirt.io', 'v1', 'virtualmachineinstances', name, namespace);
  }

  // ---------------------------------------------------------------------------
  // VM subresource actions
  // ---------------------------------------------------------------------------

  getMigration(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource(
      'kubevirt.io',
      'v1',
      'virtualmachineinstancemigrations',
      name,
      namespace,
    );
  }

  list(namespace?: string, queryParams?: Record<string, string>): Promise<KubernetesListResource> {
    return this.ctx.listResources('kubevirt.io', 'v1', 'virtualmachines', namespace, {
      limit: '250',
      ...queryParams,
    });
  }

  listInstances(
    namespace?: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources('kubevirt.io', 'v1', 'virtualmachineinstances', namespace, {
      limit: '250',
      ...queryParams,
    });
  }

  // ---------------------------------------------------------------------------
  // VirtualMachineInstances
  // ---------------------------------------------------------------------------

  listMigrations(
    namespace?: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      'kubevirt.io',
      'v1',
      'virtualmachineinstancemigrations',
      namespace,
      { limit: '250', ...queryParams },
    );
  }

  mergePatch(
    namespace: string,
    name: string,
    patch: Record<string, unknown>,
  ): Promise<KubernetesResource | null> {
    return this.ctx.mergePatchResource(
      'kubevirt.io',
      'v1',
      'virtualmachines',
      name,
      patch,
      namespace,
    );
  }

  patch(namespace: string, name: string, patch: JsonPatchOp[]): Promise<KubernetesResource | null> {
    return this.ctx.patchResource('kubevirt.io', 'v1', 'virtualmachines', name, patch, namespace);
  }

  // ---------------------------------------------------------------------------
  // VirtualMachineInstanceMigrations
  // ---------------------------------------------------------------------------

  /** Hard-reset a VMI (VMI-level subresource). */
  resetInstance(namespace: string, vmName: string): Promise<KubernetesResource | null> {
    return this.ctx._request(
      'put',
      `/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachineinstances/${vmName}/reset`,
      { data: {}, headers: { Accept: '*/*' } },
    );
  }

  /** Gracefully restart a running VM (recreates the VMI). */
  restart(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx._request(
      'put',
      `/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachines/${name}/restart`,
      { data: {}, headers: { Accept: '*/*' } },
    );
  }

  /** Start a VM (sets runStrategy: Always via subresource). */
  start(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx._request(
      'put',
      `/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachines/${name}/start`,
      { data: {}, headers: { Accept: '*/*' } },
    );
  }

  /** Stop a VM (sets runStrategy: Halted via subresource). */
  stop(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx._request(
      'put',
      `/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${namespace}/virtualmachines/${name}/stop`,
      { data: {}, headers: { Accept: '*/*' } },
    );
  }
}
