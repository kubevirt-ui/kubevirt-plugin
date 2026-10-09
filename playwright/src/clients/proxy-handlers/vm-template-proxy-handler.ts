import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';

import type { ProxyApiContext } from './proxy-api-context';

/**
 * Console-proxy handler for KubeVirt VirtualMachineTemplates
 * (template.kubevirt.io/v1beta1).
 *
 * Access via `apiClient.vmTemplate.*`
 */
export class VmTemplateProxyHandler {
  private static readonly GROUP = 'template.kubevirt.io';
  private static readonly PLURAL = 'virtualmachinetemplates';
  private static readonly VERSION = 'v1beta1';

  constructor(private readonly ctx: ProxyApiContext) {}

  create(namespace: string, spec: KubernetesResource): Promise<KubernetesResource | null> {
    return this.ctx.createResource(
      VmTemplateProxyHandler.GROUP,
      VmTemplateProxyHandler.VERSION,
      VmTemplateProxyHandler.PLURAL,
      spec,
      namespace,
    );
  }

  delete(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource(
      VmTemplateProxyHandler.GROUP,
      VmTemplateProxyHandler.VERSION,
      VmTemplateProxyHandler.PLURAL,
      name,
      namespace,
    );
  }

  get(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource(
      VmTemplateProxyHandler.GROUP,
      VmTemplateProxyHandler.VERSION,
      VmTemplateProxyHandler.PLURAL,
      name,
      namespace,
    );
  }

  list(namespace?: string, labelSelector?: string): Promise<KubernetesListResource> {
    const queryParams: Record<string, string> = { limit: '250' };
    if (labelSelector) queryParams.labelSelector = labelSelector;
    return this.ctx.listResources(
      VmTemplateProxyHandler.GROUP,
      VmTemplateProxyHandler.VERSION,
      VmTemplateProxyHandler.PLURAL,
      namespace,
      queryParams,
    );
  }

  mergePatch(
    namespace: string,
    name: string,
    patch: Record<string, unknown>,
  ): Promise<KubernetesResource | null> {
    return this.ctx.mergePatchResource(
      VmTemplateProxyHandler.GROUP,
      VmTemplateProxyHandler.VERSION,
      VmTemplateProxyHandler.PLURAL,
      name,
      patch,
      namespace,
    );
  }

  patch(namespace: string, name: string, patch: JsonPatchOp[]): Promise<KubernetesResource | null> {
    return this.ctx.patchResource(
      VmTemplateProxyHandler.GROUP,
      VmTemplateProxyHandler.VERSION,
      VmTemplateProxyHandler.PLURAL,
      name,
      patch,
      namespace,
    );
  }
}
