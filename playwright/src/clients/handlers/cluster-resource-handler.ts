import type { JsonPatchOp, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { TestTimeouts } from '@/utils/test-config';
import { waitForCondition } from '@/utils/wait-helpers';

import type { KubernetesHandlerContext } from './kubernetes-api-context';

export class ClusterResourceHandler {
  constructor(private readonly ctx: KubernetesHandlerContext) {}

  async deleteAllCustomResources(
    group: string,
    version: string,
    plural: string,
    namespace: string,
    options?: { ignoreErrors?: boolean },
  ): Promise<void> {
    try {
      const resources = await this.ctx.listCustomResources(group, version, namespace, plural);
      const deletePromises = resources.map((resource: KubernetesResource) => {
        const name = resource.metadata?.name;
        if (!name) return Promise.resolve();
        return this.ctx
          .deleteCustomResource(group, version, namespace, plural, name)
          .catch((error: unknown) => {
            if (!options?.ignoreErrors) {
              throw error;
            }
          });
      });
      await Promise.allSettled(deletePromises);
    } catch (error: unknown) {
      if (!options?.ignoreErrors) {
        throw error;
      }
    }
  }

  async ensureClusterObservabilityOperatorUninstalled(): Promise<void> {
    const namespace = 'openshift-cluster-observability-operator';
    const group = 'operators.coreos.com';
    const version = 'v1alpha1';

    const subscriptions = await this.ctx.listCustomResources(
      group,
      version,
      namespace,
      'subscriptions',
    );
    await Promise.allSettled(
      subscriptions.map((sub: { metadata?: { name?: string } }) => {
        const name = sub.metadata?.name;
        if (!name) return Promise.resolve();
        return this.ctx
          .deleteCustomResource(group, version, namespace, 'subscriptions', name)
          .catch(() => {
            return;
          });
      }),
    );

    const csvs = await this.ctx.listCustomResources(
      group,
      version,
      namespace,
      'clusterserviceversions',
    );
    await Promise.allSettled(
      csvs.map((csv: { metadata?: { name?: string } }) => {
        const name = csv.metadata?.name;
        if (!name) return Promise.resolve();
        return this.ctx
          .deleteCustomResource(group, version, namespace, 'clusterserviceversions', name)
          .catch(() => {
            return;
          });
      }),
    );
  }

  async getStorageClassNames(): Promise<string[]> {
    const items = await this.ctx.listClusterCustomResources(
      'storage.k8s.io',
      'v1',
      'storageclasses',
    );
    return items
      .map((sc) => sc?.metadata?.name as string | undefined)
      .filter((n): n is string => Boolean(n && String(n).trim()))
      .map((n) => n.trim());
  }

  async isClusterObservabilityOperatorInstalled(): Promise<boolean> {
    const namespace = 'openshift-cluster-observability-operator';
    const subscriptions = await this.ctx.listCustomResources(
      'operators.coreos.com',
      'v1alpha1',
      namespace,
      'subscriptions',
    );
    return subscriptions.some(
      (sub: { status?: { installedCSV?: string } }) => !!sub.status?.installedCSV,
    );
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
      const res = response as { body?: KubernetesResource } | KubernetesResource;
      return ('body' in res && res.body !== undefined ? res.body : res) as KubernetesResource;
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
      const res = response as { body?: KubernetesResource } | KubernetesResource;
      return ('body' in res && res.body !== undefined ? res.body : res) as KubernetesResource;
    } catch (error: unknown) {
      throw new Error(`Failed to patch cluster custom resource ${name}: ${getErrorMessage(error)}`);
    }
  }

  async setDefaultStorageClassForVirtualMachines(storageClassName: string): Promise<void> {
    const group = 'storage.k8s.io';
    const version = 'v1';
    const plural = 'storageclasses';
    const annotationPath = '/metadata/annotations/storageclass.kubevirt.io~1is-default-virt-class';

    const items = await this.ctx.listClusterCustomResources(group, version, plural);
    const names = items
      .map((sc) => sc?.metadata?.name as string | undefined)
      .filter((n): n is string => Boolean(n && n.trim()))
      .map((n) => n.trim());

    const clearPatch = [{ op: 'add' as const, path: annotationPath, value: 'false' }];
    const setPatch = [{ op: 'add' as const, path: annotationPath, value: 'true' }];

    for (const name of names) {
      await this.patchClusterCustomResourceWithJsonPatch(group, version, plural, name, clearPatch);
    }
    await this.patchClusterCustomResourceWithJsonPatch(
      group,
      version,
      plural,
      storageClassName,
      setPatch,
    );
  }

  async waitForClusterObservabilityOperatorInstalled(
    timeoutMs: number = TestTimeouts.OPERATOR_INSTALL,
  ): Promise<boolean> {
    return waitForCondition(() => this.isClusterObservabilityOperatorInstalled(), timeoutMs, 10000);
  }
}
