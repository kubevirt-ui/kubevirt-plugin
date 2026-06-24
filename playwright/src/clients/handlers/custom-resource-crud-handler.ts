import type { JsonPatchOp, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';

import { getKubernetesProxyUrl, makeKubernetesProxyRequest } from '../kubernetes-proxy';

import type { KubernetesHandlerContext } from './kubernetes-api-context';

function unwrapCustomObjectResponse(response: unknown): KubernetesResource {
  if (typeof response === 'object' && response !== null && 'body' in response) {
    return (response as { body: KubernetesResource }).body;
  }
  return response as KubernetesResource;
}

function asK8sClientError(error: unknown): {
  statusCode?: number;
  response?: { statusCode?: number; status?: number };
  message?: string;
} {
  return error as {
    statusCode?: number;
    response?: { statusCode?: number; status?: number };
    message?: string;
  };
}

/**
 * Generic namespaced / cluster CustomObject CRUD via CustomObjectsApi, with HTTP(S)_PROXY
 * support matching KubernetesClient historical behavior.
 */
export class CustomResourceCrudHandler {
  constructor(private readonly ctx: KubernetesHandlerContext) {}

  async createCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    body: unknown,
  ): Promise<KubernetesResource> {
    try {
      const response = await this.ctx.customObjectsApi.createNamespacedCustomObject({
        body: body as KubernetesResource,
        group,
        namespace,
        plural,
        version,
      });
      return response.body as KubernetesResource;
    } catch (error: unknown) {
      throw new Error(`Failed to create custom resource: ${getErrorMessage(error)}`);
    }
  }

  async createClusterCustomResource(
    group: string,
    version: string,
    plural: string,
    body: unknown,
  ): Promise<KubernetesResource> {
    try {
      const response = await this.ctx.customObjectsApi.createClusterCustomObject({
        group,
        body: body as KubernetesResource,
        plural,
        version,
      });
      return response.body as KubernetesResource;
    } catch (error: unknown) {
      throw new Error(`Failed to create cluster custom resource: ${getErrorMessage(error)}`);
    }
  }

  async deleteClusterCustomResource(
    group: string,
    version: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource | undefined> {
    const proxyUrl = getKubernetesProxyUrl();

    if (proxyUrl) {
      try {
        await makeKubernetesProxyRequest(
          this.ctx.kc,
          'DELETE',
          `/apis/${group}/${version}/${plural}/${encodeURIComponent(name)}`,
        );
        return undefined;
      } catch (error: unknown) {
        throw new Error(
          `Failed to delete cluster custom resource ${name}: ${getErrorMessage(error)}`,
        );
      }
    }

    try {
      const response = await this.ctx.customObjectsApi.deleteClusterCustomObject({
        group,
        name,
        plural,
        version,
      });
      return response.body;
    } catch (error: unknown) {
      throw new Error(
        `Failed to delete cluster custom resource ${name}: ${getErrorMessage(error)}`,
      );
    }
  }

  async deleteCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource | undefined> {
    const proxyUrl = getKubernetesProxyUrl();

    if (proxyUrl) {
      try {
        await makeKubernetesProxyRequest(
          this.ctx.kc,
          'DELETE',
          `/apis/${group}/${version}/namespaces/${encodeURIComponent(
            namespace,
          )}/${plural}/${encodeURIComponent(name)}`,
        );
        return undefined;
      } catch (error: unknown) {
        throw new Error(`Failed to delete custom resource ${name}: ${getErrorMessage(error)}`);
      }
    }

    try {
      const response = await this.ctx.customObjectsApi.deleteNamespacedCustomObject({
        group,
        name,
        namespace,
        plural,
        version,
      });
      return response.body;
    } catch (error: unknown) {
      throw new Error(`Failed to delete custom resource ${name}: ${getErrorMessage(error)}`);
    }
  }

  /** DELETE /api/v1/namespaces/{namespace}/services/{name}. Uses proxy path when HTTP(S)_PROXY is set. */
  async deleteNamespacedService(namespace: string, name: string): Promise<void> {
    const proxyUrl = getKubernetesProxyUrl();

    if (proxyUrl) {
      await makeKubernetesProxyRequest(
        this.ctx.kc,
        'DELETE',
        `/api/v1/namespaces/${encodeURIComponent(namespace)}/services/${encodeURIComponent(name)}`,
      );
      return;
    }

    await this.ctx.coreV1Api.deleteNamespacedService({ name, namespace });
  }

  async patchResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    namespace: string,
    patchBody: JsonPatchOp[] | Record<string, unknown>,
  ): Promise<KubernetesResource> {
    try {
      const response = await this.ctx.customObjectsApi.patchNamespacedCustomObject({
        group,
        version,
        namespace,
        plural,
        name,
        body: patchBody,
      });
      return unwrapCustomObjectResponse(response);
    } catch (error: unknown) {
      throw new Error(`Failed to patch custom resource ${name}: ${getErrorMessage(error)}`);
    }
  }

  async getClusterCustomResource(
    group: string,
    version: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource> {
    const proxyUrl = getKubernetesProxyUrl();

    if (proxyUrl) {
      try {
        const result = await makeKubernetesProxyRequest(
          this.ctx.kc,
          'GET',
          `/apis/${group}/${version}/${plural}/${name}`,
        );
        if (!result) {
          throw new Error(`Failed to get cluster custom resource ${name}: empty response`);
        }
        return result;
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        const statusCode = msg.match(/HTTP (\d+)/)?.[1];
        const errorMsg = `Failed to get cluster custom resource ${name}${
          statusCode ? ` (${statusCode})` : ''
        }: ${msg}`;
        const newError = new Error(errorMsg) as Error & { statusCode?: number };
        newError.statusCode = statusCode ? parseInt(statusCode, 10) : undefined;
        throw newError;
      }
    }

    try {
      const response: unknown = await this.ctx.customObjectsApi.getClusterCustomObject({
        group,
        name,
        plural,
        version,
      });
      return unwrapCustomObjectResponse(response);
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const statusCode = e.statusCode || e.response?.statusCode;
      const statusText = statusCode ? ` (${statusCode})` : '';
      const msg = getErrorMessage(error);
      const errorMsg = `Failed to get cluster custom resource ${name}${statusText}: ${msg}`;
      const newError = new Error(errorMsg) as Error & { statusCode?: number };
      newError.statusCode = typeof statusCode === 'number' ? statusCode : e.response?.status;
      throw newError;
    }
  }

  async getCustomResource(
    group: string,
    version: string,
    namespace: string,
    plural: string,
    name: string,
  ): Promise<KubernetesResource> {
    const proxyUrl = getKubernetesProxyUrl();

    if (proxyUrl) {
      try {
        const result = await makeKubernetesProxyRequest(
          this.ctx.kc,
          'GET',
          `/apis/${group}/${version}/namespaces/${namespace}/${plural}/${name}`,
        );
        if (!result) {
          throw new Error(`Failed to get custom resource ${name}: empty response`);
        }
        return result;
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        const statusCode = msg.match(/HTTP (\d+)/)?.[1];
        const errorMsg = `Failed to get custom resource ${name} in namespace ${namespace}${
          statusCode ? ` (${statusCode})` : ''
        }: ${msg}`;
        const newError = new Error(errorMsg) as Error & { statusCode?: number };
        newError.statusCode = statusCode ? parseInt(statusCode, 10) : undefined;
        throw newError;
      }
    }

    try {
      const response: unknown = await this.ctx.customObjectsApi.getNamespacedCustomObject({
        group,
        name,
        namespace,
        plural,
        version,
      });
      return unwrapCustomObjectResponse(response);
    } catch (error: unknown) {
      const e = asK8sClientError(error);
      const statusCode = e.statusCode || e.response?.statusCode;
      const statusText = statusCode ? ` (${statusCode})` : '';
      const msg = getErrorMessage(error);
      const errorMsg = `Failed to get custom resource ${name} in namespace ${namespace}${statusText}: ${msg}`;
      const newError = new Error(errorMsg) as Error & { statusCode?: number };
      newError.statusCode = typeof statusCode === 'number' ? statusCode : e.response?.status;
      throw newError;
    }
  }

  async listClusterCustomResources(
    group: string,
    version: string,
    plural: string,
  ): Promise<KubernetesResource[]> {
    try {
      let body: unknown;

      if (getKubernetesProxyUrl()) {
        body = await makeKubernetesProxyRequest(
          this.ctx.kc,
          'GET',
          `/apis/${group}/${version}/${plural}`,
        );
      } else {
        const response = await this.ctx.customObjectsApi.listClusterCustomObject({
          group,
          plural,
          version,
        });
        body = (response as { body?: unknown })?.body ?? response;
      }

      return (body as { items?: KubernetesResource[] })?.items || [];
    } catch {
      return [];
    }
  }

  async listCustomResources(
    group: string,
    version: string,
    namespace: string,
    plural: string,
  ): Promise<KubernetesResource[]> {
    try {
      let body: unknown;

      if (getKubernetesProxyUrl()) {
        body = await makeKubernetesProxyRequest(
          this.ctx.kc,
          'GET',
          `/apis/${group}/${version}/namespaces/${namespace}/${plural}`,
        );
      } else {
        const response = await this.ctx.customObjectsApi.listNamespacedCustomObject({
          group,
          namespace,
          plural,
          version,
        });
        body = (response as { body?: unknown })?.body ?? response;
      }

      return (body as { items?: KubernetesResource[] })?.items || [];
    } catch {
      return [];
    }
  }

  async deleteAllCustomResources(
    group: string,
    version: string,
    plural: string,
    namespace: string,
    options?: { ignoreErrors?: boolean },
  ): Promise<void> {
    try {
      const resources = await this.listCustomResources(group, version, namespace, plural);
      const deletePromises = resources.map((resource: KubernetesResource) => {
        const resName = resource.metadata?.name;
        if (!resName) return Promise.resolve();
        return this.deleteCustomResource(group, version, namespace, plural, resName).catch(
          (err: unknown) => {
            if (!options?.ignoreErrors) {
              throw err;
            }
          },
        );
      });
      await Promise.allSettled(deletePromises);
    } catch (error: unknown) {
      if (!options?.ignoreErrors) {
        throw error;
      }
    }
  }

  async patchClusterCustomResource(
    group: string,
    version: string,
    plural: string,
    name: string,
    patchBody: JsonPatchOp[] | Record<string, unknown>,
  ): Promise<KubernetesResource> {
    try {
      const response = await this.ctx.customObjectsApi.patchClusterCustomObject({
        body: patchBody,
        group,
        name,
        plural,
        version,
      });
      return unwrapCustomObjectResponse(response);
    } catch (error: unknown) {
      throw new Error(`Failed to patch cluster custom resource ${name}: ${getErrorMessage(error)}`);
    }
  }

  async patchClusterCustomResourceWithJsonPatch(
    group: string,
    version: string,
    plural: string,
    name: string,
    patchOps: JsonPatchOp[],
  ): Promise<KubernetesResource> {
    try {
      const response = await this.ctx.customObjectsApi.patchClusterCustomObject(
        {
          body: patchOps,
          group,
          name,
          plural,
          version,
        },
        undefined,
      );
      return unwrapCustomObjectResponse(response);
    } catch (error: unknown) {
      throw new Error(`Failed to patch cluster custom resource ${name}: ${getErrorMessage(error)}`);
    }
  }
}
