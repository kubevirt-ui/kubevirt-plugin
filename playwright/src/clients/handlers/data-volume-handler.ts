import type { KubernetesCondition, KubernetesResource } from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { TestTimeouts } from '@/utils/test-config';

import type { KubernetesHandlerContext } from './kubernetes-api-context';

export class DataVolumeHandler {
  constructor(private readonly ctx: KubernetesHandlerContext) {}

  async createBlankDataVolume(
    dataVolumeName: string,
    namespace: string,
    size = '1Gi',
  ): Promise<KubernetesResource> {
    const dataVolumeResource: KubernetesResource = {
      apiVersion: 'cdi.kubevirt.io/v1beta1',
      kind: 'DataVolume',
      metadata: {
        name: dataVolumeName,
        namespace,
        annotations: {
          'cdi.kubevirt.io/storage.bind.immediate.requested': 'true',
        },
      },
      spec: {
        source: {
          blank: {},
        },
        storage: {
          resources: {
            requests: {
              storage: size,
            },
          },
        },
      },
    };

    return await this.ctx.createCustomResource(
      'cdi.kubevirt.io',
      'v1beta1',
      namespace,
      'datavolumes',
      dataVolumeResource,
    );
  }

  async dataSourceExists(dataSourceName: string, namespace: string): Promise<boolean> {
    try {
      await this.ctx.getCustomResource(
        'cdi.kubevirt.io',
        'v1beta1',
        namespace,
        'datasources',
        dataSourceName,
      );
      return true;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404') || msg.includes('not found')) {
        return false;
      }
      throw error;
    }
  }

  async dataVolumeExists(dataVolumeName: string, namespace: string): Promise<boolean> {
    try {
      await this.ctx.getCustomResource(
        'cdi.kubevirt.io',
        'v1beta1',
        namespace,
        'datavolumes',
        dataVolumeName,
      );
      return true;
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      if (msg.includes('404') || msg.includes('not found')) {
        return false;
      }
      throw error;
    }
  }

  async isDataSourceReady(name: string, namespace: string): Promise<boolean> {
    try {
      const ds = (await this.ctx.getCustomResource(
        'cdi.kubevirt.io',
        'v1beta1',
        namespace,
        'datasources',
        name,
      )) as KubernetesResource;
      return (
        (
          (ds?.status as Record<string, unknown> | undefined)?.conditions as
            | KubernetesCondition[]
            | undefined
        )?.some((c) => c.type === 'Ready' && c.status === 'True') ?? false
      );
    } catch {
      return false;
    }
  }

  async patchDataSourceAnnotations(
    dataSourceName: string,
    namespace: string,
    annotations: Record<string, string>,
  ): Promise<void> {
    if (Object.keys(annotations).length === 0) {
      return;
    }
    const existing = (await this.ctx.getCustomResource(
      'cdi.kubevirt.io',
      'v1beta1',
      namespace,
      'datasources',
      dataSourceName,
    )) as KubernetesResource;
    const existingAnnotations = existing?.metadata?.annotations ?? {};
    const merged = { ...existingAnnotations, ...annotations };

    const patchOps = [
      {
        op: Object.keys(existingAnnotations).length === 0 ? 'add' : 'replace',
        path: '/metadata/annotations',
        value: merged,
      },
    ];

    const patchApi = this.ctx.customObjectsApi as unknown as {
      patchNamespacedCustomObject: (
        request: {
          group: string;
          version: string;
          namespace: string;
          plural: string;
          name: string;
          body: unknown;
          dryRun?: string;
          fieldManager?: string;
          fieldValidation?: string;
        },
        contentType?: string,
        options?: { headers?: Record<string, string> },
      ) => Promise<{ body?: KubernetesResource }>;
    };

    await patchApi.patchNamespacedCustomObject(
      {
        group: 'cdi.kubevirt.io',
        version: 'v1beta1',
        namespace,
        plural: 'datasources',
        name: dataSourceName,
        body: patchOps,
        dryRun: undefined,
        fieldManager: undefined,
        fieldValidation: undefined,
      },
      'json',
      {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      },
    );
  }

  async verifyDataVolumeCreated(
    dataVolumeName: string,
    namespace: string,
    timeoutMs = 60000,
  ): Promise<{
    dataVolume?: KubernetesResource;
    error?: string;
    exists: boolean;
  }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const dataVolume = await this.ctx.getCustomResource(
          'cdi.kubevirt.io',
          'v1beta1',
          namespace,
          'datavolumes',
          dataVolumeName,
        );

        return {
          dataVolume: dataVolume,
          exists: true,
        };
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        if (msg.includes('404') || msg.includes('not found')) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }

        return {
          error: msg,
          exists: false,
        };
      }
    }

    return {
      error: `Timeout after ${timeoutMs}ms waiting for DataVolume ${dataVolumeName} to be created`,
      exists: false,
    };
  }

  async waitForDataVolumeSucceeded(
    dataVolumeName: string,
    namespace: string,
    timeoutMs: number = TestTimeouts.VM_BOOTUP,
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      try {
        const dv = (await this.ctx.getCustomResource(
          'cdi.kubevirt.io',
          'v1beta1',
          namespace,
          'datavolumes',
          dataVolumeName,
        )) as KubernetesResource;
        const phase = dv?.status?.phase;
        if (phase === 'Succeeded') {
          return;
        }
      } catch (error: unknown) {
        const msg = getErrorMessage(error);
        // DV may not exist yet (still being created) or may have already been
        // garbage-collected after succeeding (CDI deletes the DV once it becomes a PVC).
        // In both cases, continue polling rather than throwing immediately.
        if (!msg.includes('404') && !msg.includes('not found')) {
          throw error;
        }
        // Check if a PVC with the same name already exists — that means the DV
        // completed and was replaced by the PVC (i.e. it already succeeded).
        const pvcExists = await this.ctx.coreV1Api
          .readNamespacedPersistentVolumeClaim({ name: dataVolumeName, namespace })
          .then(() => true)
          .catch(() => false);
        if (pvcExists) {
          return;
        }
      }
      await new Promise((r) => setTimeout(r, TestTimeouts.POLLING_INTERVAL));
    }

    throw new Error(
      `Timeout waiting for DataVolume ${dataVolumeName} to reach Succeeded in namespace ${namespace}`,
    );
  }
}
