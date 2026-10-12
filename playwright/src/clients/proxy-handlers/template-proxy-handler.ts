import type {
  JsonPatchOp,
  KubernetesListResource,
  KubernetesResource,
} from '@/data-models/kubernetes-types';

import type { ProxyApiContext } from './proxy-api-context';

/**
 * Console-proxy handler for OpenShift Templates (template.openshift.io/v1).
 *
 * Access via `apiClient.template.*`
 */
export class TemplateProxyHandler {
  constructor(private readonly ctx: ProxyApiContext) {}

  create(namespace: string, spec: KubernetesResource): Promise<KubernetesResource | null> {
    return this.ctx.createResource('template.openshift.io', 'v1', 'templates', spec, namespace);
  }

  delete(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.deleteResource('template.openshift.io', 'v1', 'templates', name, namespace);
  }

  get(namespace: string, name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource('template.openshift.io', 'v1', 'templates', name, namespace);
  }

  /**
   * List OpenShift templates, optionally filtered by a label selector.
   * Pass `labelSelector: 'template.kubevirt.io/type'` for VM templates.
   * Pass `labelSelector: 'template.kubevirt.io/type in (base,vm)'` for the catalog.
   */
  list(namespace?: string, labelSelector?: string): Promise<KubernetesListResource> {
    const queryParams: Record<string, string> = { limit: '250' };
    if (labelSelector) queryParams.labelSelector = labelSelector;
    return this.ctx.listResources(
      'template.openshift.io',
      'v1',
      'templates',
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
      'template.openshift.io',
      'v1',
      'templates',
      name,
      patch,
      namespace,
    );
  }

  patch(namespace: string, name: string, patch: JsonPatchOp[]): Promise<KubernetesResource | null> {
    return this.ctx.patchResource(
      'template.openshift.io',
      'v1',
      'templates',
      name,
      patch,
      namespace,
    );
  }
}
