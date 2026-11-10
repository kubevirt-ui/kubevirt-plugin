import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';

import { logger } from '@/utils/logger';

import type { ProxyApiContext } from './proxy-api-context';

export class ProjectProxyHandler {
  constructor(private readonly ctx: ProxyApiContext) {}

  async createProject(
    name: string,
    labels?: Record<string, string>,
  ): Promise<KubernetesResource | null> {
    const result = await this.ctx._request(
      'post',
      '/kubernetes/apis/project.openshift.io/v1/projectrequests',
      { data: { metadata: { name } } },
    );

    if (labels) {
      await this.ctx.mergePatchResource('', 'v1', 'namespaces', name, {
        metadata: { labels },
      });
    }

    return result;
  }

  async deleteProject(name: string): Promise<KubernetesResource | null> {
    try {
      return await this.ctx._request('delete', `/kubernetes/api/v1/namespaces/${name}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('404') || msg.includes('not found') || msg.includes('NotFound')) {
        return null;
      }
      throw error;
    }
  }

  async ensureNamespace(name: string): Promise<void> {
    const exists = await this.namespaceExists(name);
    if (!exists) {
      await this.createProject(name);
    }
  }

  getNamespace(name: string): Promise<KubernetesResource | null> {
    return this.ctx.getResource('', 'v1', 'namespaces', name);
  }

  getPods(namespace: string): Promise<KubernetesListResource> {
    return this.ctx.listResources('', 'v1', 'pods', namespace);
  }

  listNamespaces(labelSelector?: string): Promise<KubernetesListResource> {
    const queryParams = labelSelector ? { labelSelector } : undefined;
    return this.ctx.listResources('', 'v1', 'namespaces', undefined, queryParams);
  }

  async namespaceExists(name: string): Promise<boolean> {
    try {
      const result = await this.ctx.getResource('', 'v1', 'namespaces', name);
      return result !== null;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('404') || msg.includes('NotFound')) {
        return false;
      }
      throw error;
    }
  }

  async setupTestNamespace(namespace: string): Promise<void> {
    logger.info(`Ensuring test namespace "${namespace}" exists...`);
    await this.ensureNamespace(namespace);
  }

  async waitForNamespaceReady(name: string, timeoutMs = 30000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const ns = await this.ctx._request('get', `/kubernetes/api/v1/namespaces/${name}`);
        const phase = (ns?.status as Record<string, unknown>)?.phase;
        if (phase === 'Active') {
          return true;
        }
      } catch {
        // Namespace may not exist yet
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    return false;
  }

  async waitForPodReady(namespace: string, podName: string, timeoutMs = 60000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const pod = await this.ctx.getResource('', 'v1', 'pods', podName, namespace);
        const conditions = (pod?.status as Record<string, unknown>)?.conditions as
          | Array<{ type: string; status: string }>
          | undefined;
        const ready = conditions?.find((c) => c.type === 'Ready');
        if (ready?.status === 'True') {
          return true;
        }
      } catch {
        // Pod may not exist yet
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    return false;
  }
}
