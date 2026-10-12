import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';

import type { ProxyApiContext } from './proxy-api-context';

/**
 * Console-proxy handler for KubeVirt instance types and preferences
 * (instancetype.kubevirt.io/v1beta1).
 *
 * Access via `apiClient.instanceType.*`
 */
export class InstanceTypeProxyHandler {
  constructor(private readonly ctx: ProxyApiContext) {}

  // ---------------------------------------------------------------------------
  // Cluster-scoped instance types & preferences
  // ---------------------------------------------------------------------------

  createClusterInstanceType(spec: KubernetesResource): Promise<KubernetesResource | null> {
    return this.ctx.createResource(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachineclusterinstancetypes',
      spec,
    );
  }

  createInstanceType(
    namespace: string,
    spec: KubernetesResource,
  ): Promise<KubernetesResource | null> {
    return this.ctx.createResource(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachineinstancetypes',
      spec,
      namespace,
    );
  }

  createPreference(
    namespace: string,
    spec: KubernetesResource,
  ): Promise<KubernetesResource | null> {
    return this.ctx.createResource(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachinepreferences',
      spec,
      namespace,
    );
  }

  deleteClusterInstanceType(name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachineclusterinstancetypes',
      name,
    );
  }

  // ---------------------------------------------------------------------------
  // Namespace-scoped instance types
  // ---------------------------------------------------------------------------

  deleteInstanceType(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachineinstancetypes',
      name,
      namespace,
    );
  }

  deletePreference(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachinepreferences',
      name,
      namespace,
    );
  }

  getInstanceType(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachineinstancetypes',
      name,
      namespace,
    );
  }

  getPreference(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachinepreferences',
      name,
      namespace,
    );
  }

  // ---------------------------------------------------------------------------
  // Namespace-scoped preferences
  // ---------------------------------------------------------------------------

  listClusterInstanceTypes(queryParams?: Record<string, string>): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachineclusterinstancetypes',
      undefined,
      { limit: '250', ...queryParams },
    );
  }

  listClusterPreferences(queryParams?: Record<string, string>): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachineclusterpreferences',
      undefined,
      { limit: '250', ...queryParams },
    );
  }

  listInstanceTypes(
    namespace: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachineinstancetypes',
      namespace,
      { limit: '250', ...queryParams },
    );
  }

  listPreferences(
    namespace: string,
    queryParams?: Record<string, string>,
  ): Promise<KubernetesListResource> {
    return this.ctx.listResources(
      'instancetype.kubevirt.io',
      'v1beta1',
      'virtualmachinepreferences',
      namespace,
      { limit: '250', ...queryParams },
    );
  }
}
