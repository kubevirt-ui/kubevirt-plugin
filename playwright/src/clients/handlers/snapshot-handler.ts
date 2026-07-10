import type { KubernetesListResource, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { TestTimeouts } from '@/utils/test-config';

import type { KubernetesHandlerContext } from './kubernetes-api-context';

export class SnapshotHandler {
  constructor(private readonly ctx: KubernetesHandlerContext) {}

  private isNonZeroQuantity(q: unknown): boolean {
    if (q == null) return false;
    if (typeof q === 'number') return q > 0;
    const str = typeof q === 'string' ? q : (q as { value?: string })?.value;
    if (str == null || str === '') return false;
    const parsed = parseInt(str, 10);
    if (!Number.isNaN(parsed)) return parsed > 0;
    return str !== '0' && !/^0+$/.test(str);
  }

  async createVmSnapshot(
    snapshotName: string,
    vmName: string,
    namespace: string,
  ): Promise<KubernetesResource> {
    const snapshotSpec: KubernetesResource = {
      apiVersion: 'snapshot.kubevirt.io/v1beta1',
      kind: 'VirtualMachineSnapshot',
      metadata: {
        name: snapshotName,
        namespace: namespace,
      },
      spec: {
        source: {
          apiGroup: 'kubevirt.io',
          kind: 'VirtualMachine',
          name: vmName,
        },
      },
    };

    return await this.ctx.createCustomResource(
      'snapshot.kubevirt.io',
      'v1beta1',
      namespace,
      'virtualmachinesnapshots',
      snapshotSpec,
    );
  }

  async createVolumeSnapshot(
    snapshotName: string,
    namespace: string,
    sourcePvcName: string,
    volumeSnapshotClassName?: string,
  ): Promise<KubernetesResource> {
    const body: KubernetesResource = {
      apiVersion: 'snapshot.storage.k8s.io/v1',
      kind: 'VolumeSnapshot',
      metadata: { name: snapshotName, namespace },
      spec: {
        source: { persistentVolumeClaimName: sourcePvcName },
      },
    };
    if (volumeSnapshotClassName) {
      const spec = (body.spec as Record<string, unknown>) ?? {};
      body.spec = { ...spec, volumeSnapshotClassName };
    }
    return await this.ctx.createCustomResource(
      'snapshot.storage.k8s.io',
      'v1',
      namespace,
      'volumesnapshots',
      body,
    );
  }

  async deleteVolumesnapshotsByLabel(
    namespace: string,
    labels: Record<string, string>,
    timeoutMs = 30000,
  ): Promise<boolean> {
    const labelSelector = Object.entries(labels)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    try {
      const response = await this.ctx.customObjectsApi.listNamespacedCustomObject({
        group: 'snapshot.storage.k8s.io',
        version: 'v1',
        namespace,
        plural: 'volumesnapshots',
        labelSelector,
      });

      const items =
        (response.body as KubernetesListResource<KubernetesResource>).items ??
        ([] as KubernetesResource[]);

      for (const item of items) {
        const name = item.metadata?.name;
        if (name) {
          try {
            await this.ctx.customObjectsApi.deleteNamespacedCustomObject({
              group: 'snapshot.storage.k8s.io',
              version: 'v1',
              namespace,
              plural: 'volumesnapshots',
              name,
            });
          } catch {
            // Ignore deletion errors (already deleted or not found)
          }
        }
      }
    } catch {
      // If listing fails, continue to wait loop
    }

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await this.ctx.customObjectsApi.listNamespacedCustomObject({
          group: 'snapshot.storage.k8s.io',
          version: 'v1',
          namespace,
          plural: 'volumesnapshots',
          labelSelector,
        });

        const items =
          (response.body as KubernetesListResource<KubernetesResource>).items ??
          ([] as KubernetesResource[]);
        if (items.length === 0) {
          return true;
        }
      } catch {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    try {
      const response = await this.ctx.customObjectsApi.listNamespacedCustomObject({
        group: 'snapshot.storage.k8s.io',
        version: 'v1',
        namespace,
        plural: 'volumesnapshots',
        labelSelector,
      });

      const items =
        (response.body as KubernetesListResource<KubernetesResource>).items ??
        ([] as KubernetesResource[]);
      return items.length === 0;
    } catch {
      return true;
    }
  }

  async getVirtualMachineSnapshot(
    snapshotName: string,
    namespace: string,
  ): Promise<KubernetesResource> {
    return await this.ctx.getCustomResource(
      'snapshot.kubevirt.io',
      'v1beta1',
      namespace,
      'virtualmachinesnapshots',
      snapshotName,
    );
  }

  async getVolumeSnapshotNameFromVirtualMachineSnapshot(
    virtualMachineSnapshotName: string,
    namespace: string,
    timeoutMs: number = TestTimeouts.DATA_VOLUME_STATUS,
    singleAttempt = false,
  ): Promise<string> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const items = await this.listVolumeSnapshotsInNamespace(namespace);
      for (const vs of items) {
        const owners = vs.metadata?.ownerReferences || [];
        const ownedByVms = owners.some(
          (ref: { kind?: string; name?: string }) =>
            ref.kind === 'VirtualMachineSnapshot' && ref.name === virtualMachineSnapshotName,
        );
        if (ownedByVms && vs.metadata?.name) {
          return vs.metadata.name;
        }
      }
      if (singleAttempt) {
        break;
      }
      await new Promise((r) => setTimeout(r, TestTimeouts.POLLING_INTERVAL));
    }
    throw new Error(
      `No VolumeSnapshot found for VirtualMachineSnapshot ${virtualMachineSnapshotName} in namespace ${namespace}${
        singleAttempt ? '' : ` within ${timeoutMs}ms`
      }`,
    );
  }

  async getVolumesnapshotsByLabel(
    namespace: string,
    labels: Record<string, string>,
    namePattern?: string,
    timeoutMs = 60000,
  ): Promise<KubernetesResource[]> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const labelSelector = Object.entries(labels)
          .map(([key, value]) => `${key}=${value}`)
          .join(',');

        const response = await this.ctx.customObjectsApi.listNamespacedCustomObject({
          group: 'snapshot.storage.k8s.io',
          version: 'v1',
          namespace,
          plural: 'volumesnapshots',
          labelSelector,
        });

        const items =
          (response.body as KubernetesListResource<KubernetesResource>).items ??
          ([] as KubernetesResource[]);

        if (items.length > 0) {
          if (namePattern) {
            const matching = items.filter((item) => item.metadata?.name?.includes(namePattern));
            if (matching.length > 0) {
              return matching;
            }
          } else {
            return items;
          }
        }
      } catch {
        // Continue waiting if there's an error
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return [];
  }

  async listVolumeSnapshotsInNamespace(namespace: string): Promise<KubernetesResource[]> {
    return await this.ctx.listCustomResources(
      'snapshot.storage.k8s.io',
      'v1',
      namespace,
      'volumesnapshots',
    );
  }

  async waitForRestoreDeleted(
    restoreName: string,
    namespace: string,
    timeoutMs = 60000,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        await this.ctx.getCustomResource(
          'snapshot.kubevirt.io',
          'v1beta1',
          namespace,
          'virtualmachinerestores',
          restoreName,
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg.includes('404') || msg.includes('not found')) {
          return true;
        }
        throw error;
      }
    }

    throw new Error(`Restore ${restoreName} was not deleted within ${timeoutMs}ms`);
  }

  async waitForSnapshotDeleted(
    snapshotName: string,
    namespace: string,
    timeoutMs = 60000,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        await this.ctx.getCustomResource(
          'snapshot.kubevirt.io',
          'v1beta1',
          namespace,
          'virtualmachinesnapshots',
          snapshotName,
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg.includes('404') || msg.includes('not found')) {
          return true;
        }
        throw error;
      }
    }

    throw new Error(`Snapshot ${snapshotName} was not deleted within ${timeoutMs}ms`);
  }

  async waitForSnapshotReady(
    snapshotName: string,
    namespace: string,
    timeoutMs = 60000,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const snapshot = (await this.ctx.getCustomResource(
          'snapshot.kubevirt.io',
          'v1beta1',
          namespace,
          'virtualmachinesnapshots',
          snapshotName,
        )) as KubernetesResource;

        const status = snapshot.status as Record<string, unknown> | undefined;
        const readyToUse = status?.['readyToUse'];
        if (readyToUse === true) {
          return true;
        }

        const phase = status?.['phase'];
        if (phase === 'Failed') {
          throw new Error(`Snapshot ${snapshotName} failed`);
        }
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg.includes('404') || msg.includes('not found')) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }
        if (msg.includes('Snapshot') && msg.includes('failed')) {
          throw error;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error(`Snapshot ${snapshotName} did not become ready within ${timeoutMs}ms`);
  }

  async waitForVolumeSnapshotReady(
    snapshotName: string,
    namespace: string,
    timeoutMs: number = TestTimeouts.RESOURCE_CREATION,
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const vs = (await this.ctx.getCustomResource(
          'snapshot.storage.k8s.io',
          'v1',
          namespace,
          'volumesnapshots',
          snapshotName,
        )) as KubernetesResource;
        const vsStatus = vs.status as Record<string, unknown> | undefined;
        if (vsStatus?.['readyToUse'] !== true) {
          await new Promise((r) => setTimeout(r, TestTimeouts.POLLING_INTERVAL));
          continue;
        }
        const restoreSize = vsStatus?.['restoreSize'];
        if (restoreSize != null && this.isNonZeroQuantity(restoreSize)) {
          return;
        }
      } catch {
        // Not found or not ready yet
      }
      await new Promise((r) => setTimeout(r, TestTimeouts.POLLING_INTERVAL));
    }
    throw new Error(
      `Timeout waiting for VolumeSnapshot ${snapshotName} to be ready with non-zero size in namespace ${namespace}`,
    );
  }
}
