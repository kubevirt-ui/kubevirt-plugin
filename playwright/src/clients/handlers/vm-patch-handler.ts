import type {
  JsonPatchOp,
  KubernetesCondition,
  KubernetesResource,
} from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { generateRandomString } from '@/utils/random-data-generator';
import type {
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/dist/kubevirt/index';

import type { KubernetesHandlerContext } from './kubernetes-api-context';
import type { SecretConfigMapHandler } from './secret-configmap-handler';
import type { VmLifecycleHandler } from './vm-lifecycle-handler';

/** JSON Patch request options (e.g. application/json-patch+json). */
interface JsonPatchRequestOptions {
  headers: Record<string, string>;
}

/** Narrow view of CustomObjectsApi patch overloads used with json-patch content type. */
interface CustomObjectsJsonPatchApi {
  patchNamespacedCustomObject(
    requestParameters: Record<string, unknown>,
    contentType: string,
    options?: JsonPatchRequestOptions,
  ): Promise<unknown>;
  patchNamespacedCustomObjectStatus(
    requestParameters: Record<string, unknown>,
    contentType: string,
    options?: JsonPatchRequestOptions,
  ): Promise<unknown>;
}

interface CoreV1JsonPatchApi {
  patchNamespacedConfigMap(
    requestParameters: Record<string, unknown>,
    contentType: string,
    options?: Record<string, unknown>,
  ): Promise<unknown>;
}

function getKubeClientHttpStatus(error: unknown): number | undefined {
  if (error === null || typeof error !== 'object') return undefined;
  const e = error as { statusCode?: unknown; response?: unknown };
  if (typeof e.statusCode === 'number') return e.statusCode;
  if (e.response !== null && typeof e.response === 'object' && 'statusCode' in e.response) {
    const status = (e.response as { statusCode?: unknown }).statusCode;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}

function unwrapPatchResponse(response: unknown): KubernetesResource {
  if (response !== null && typeof response === 'object' && 'body' in response) {
    const body = (response as { body?: unknown }).body;
    if (body !== null && typeof body === 'object') return body as KubernetesResource;
  }
  return response as KubernetesResource;
}

export class VmPatchHandler {
  private static readonly DESCHEDULER_EVICT_ANNOTATION_KEY =
    'descheduler.alpha.kubernetes.io/evict';

  constructor(
    private readonly ctx: KubernetesHandlerContext,
    private readonly lifecycle: VmLifecycleHandler,
    private readonly secret: SecretConfigMapHandler,
  ) {}

  private get customObjectsJsonPatch(): CustomObjectsJsonPatchApi {
    return this.ctx.customObjectsApi as unknown as CustomObjectsJsonPatchApi;
  }

  private get coreV1JsonPatch(): CoreV1JsonPatchApi {
    return this.ctx.coreV1Api as unknown as CoreV1JsonPatchApi;
  }

  /**
   * Patch a VirtualMachine's CPU and memory resources.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @param resources - Resource configuration (cpuSockets, cpuCores, memory)
   * @returns The patched VirtualMachine resource
   * @throws {Error} When patch operation fails
   */
  async patchVirtualMachineResources(
    vmName: string,
    namespace: string,
    resources: {
      cpuSockets?: number;
      cpuCores?: number;
      memory?: string;
    },
  ): Promise<V1VirtualMachine> {
    try {
      const patchOps: JsonPatchOp[] = [];

      if (resources.cpuSockets !== undefined) {
        patchOps.push({
          op: 'replace',
          path: '/spec/template/spec/domain/cpu/sockets',
          value: resources.cpuSockets,
        });
      }

      if (resources.cpuCores !== undefined) {
        patchOps.push({
          op: 'replace',
          path: '/spec/template/spec/domain/cpu/cores',
          value: resources.cpuCores,
        });
      }

      if (resources.memory !== undefined) {
        patchOps.push({
          op: 'replace',
          path: '/spec/template/spec/domain/memory/guest',
          value: resources.memory,
        });
      }

      if (patchOps.length === 0) {
        throw new Error('No resource values provided to patch');
      }

      const response = await this.customObjectsJsonPatch.patchNamespacedCustomObject(
        {
          group: 'kubevirt.io',
          version: 'v1',
          namespace: namespace,
          plural: 'virtualmachines',
          name: vmName,
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
      return unwrapPatchResponse(response) as unknown as V1VirtualMachine;
    } catch (error: unknown) {
      const statusCode = getKubeClientHttpStatus(error);
      const statusText = statusCode ? ` (${statusCode})` : '';
      throw new Error(
        `Failed to patch VirtualMachine resources${statusText}: ${getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Patch a VirtualMachine to add a node selector.
   * This can trigger scheduling alerts if the selector doesn't match any nodes.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @param nodeSelector - Node selector key-value pairs (e.g., { 'nonexistent-label': 'nonexistent-value' })
   * @returns The patched VirtualMachine resource
   * @throws {Error} When patch operation fails
   */
  async patchVirtualMachineNodeSelector(
    vmName: string,
    namespace: string,
    nodeSelector: { [key: string]: string },
  ): Promise<V1VirtualMachine> {
    try {
      const patchOps: JsonPatchOp[] = [
        {
          op: 'replace',
          path: '/spec/template/spec/nodeSelector',
          value: nodeSelector,
        },
      ];

      const response = await this.customObjectsJsonPatch.patchNamespacedCustomObject(
        {
          group: 'kubevirt.io',
          version: 'v1',
          namespace: namespace,
          plural: 'virtualmachines',
          name: vmName,
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
      return unwrapPatchResponse(response) as unknown as V1VirtualMachine;
    } catch (error: unknown) {
      const statusCode = getKubeClientHttpStatus(error);
      const statusText = statusCode ? ` (${statusCode})` : '';
      throw new Error(
        `Failed to patch VirtualMachine node selector${statusText}: ${getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Patch a VirtualMachine to set the run strategy.
   * This removes the deprecated 'running' field and sets 'runStrategy' instead.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @param runStrategy - The run strategy ('Always', 'Manual', or 'RerunOnFailure')
   * @returns The patched VirtualMachine resource
   * @throws {Error} When patch operation fails
   */
  async patchVirtualMachineRunStrategy(
    vmName: string,
    namespace: string,
    runStrategy: 'Always' | 'Manual' | 'RerunOnFailure',
  ): Promise<V1VirtualMachine> {
    try {
      const currentVm = await this.lifecycle.getVirtualMachine(vmName, namespace);

      const patchOps: JsonPatchOp[] = [
        {
          op: 'replace',
          path: '/spec/runStrategy',
          value: runStrategy,
        },
      ];

      if (currentVm?.spec?.running !== undefined) {
        patchOps.push({
          op: 'remove',
          path: '/spec/running',
        });
      }

      const response = await this.customObjectsJsonPatch.patchNamespacedCustomObject(
        {
          group: 'kubevirt.io',
          version: 'v1',
          namespace: namespace,
          plural: 'virtualmachines',
          name: vmName,
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
      return unwrapPatchResponse(response) as unknown as V1VirtualMachine;
    } catch (error: unknown) {
      throw new Error(`Failed to patch VirtualMachine run strategy: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Patch a VirtualMachine's eviction strategy (e.g. LiveMigrate).
   * When set to LiveMigrate on a single-node cluster, the VM becomes "not migratable"
   * and can trigger the VMCannotBeEvicted warning in the overview alerts card.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @param evictionStrategy - Eviction strategy ('LiveMigrate' | 'None')
   */
  async patchVmEvictionStrategy(
    vmName: string,
    namespace: string,
    evictionStrategy: 'LiveMigrate' | 'None',
  ) {
    const patchOps: JsonPatchOp[] = [
      {
        op: 'add',
        path: '/spec/template/spec/evictionStrategy',
        value: evictionStrategy,
      },
    ];
    await this.customObjectsJsonPatch.patchNamespacedCustomObject(
      {
        group: 'kubevirt.io',
        version: 'v1',
        namespace,
        plural: 'virtualmachines',
        name: vmName,
        body: patchOps,
      },
      'json',
      {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      },
    );
  }

  /**
   * Patch a VirtualMachine's network interface model (e.g. virtio → e1000e).
   * Triggers a "Pending changes" alert in the UI for the running VM.
   * On LiveUpdate clusters (4.20+), the change may auto-apply; otherwise a restart is needed.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   * @param model - Target NIC model ('virtio' | 'e1000e')
   * @param interfaceIndex - Zero-based index of the interface to patch (default: 0)
   */
  async patchVmNetworkInterfaceModel(
    vmName: string,
    namespace: string,
    model: 'e1000e' | 'virtio',
    interfaceIndex = 0,
  ): Promise<void> {
    const patchOps: JsonPatchOp[] = [
      {
        op: 'add',
        path: `/spec/template/spec/domain/devices/interfaces/${interfaceIndex}/model`,
        value: model,
      },
    ];
    await this.customObjectsJsonPatch.patchNamespacedCustomObject(
      {
        group: 'kubevirt.io',
        version: 'v1',
        namespace,
        plural: 'virtualmachines',
        name: vmName,
        body: patchOps,
      },
      'json',
      {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      },
    );
  }

  /**
   * Set or clear the descheduler eviction annotation on the VM pod template.
   * The Scheduling tab should reflect this value after refresh/navigation.
   */
  async patchVmDeschedulerEvictAnnotation(
    vmName: string,
    namespace: string,
    enabled: boolean,
  ): Promise<void> {
    const key = VmPatchHandler.DESCHEDULER_EVICT_ANNOTATION_KEY;
    const keySegment = key.replace(/\//g, '~1').replace(/~/g, '~0');
    const annPath = '/spec/template/metadata/annotations';
    const keyPath = `${annPath}/${keySegment}`;

    const vm = (await this.lifecycle.getVirtualMachine(
      vmName,
      namespace,
    )) as unknown as V1VirtualMachine;
    const templateMeta = vm.spec?.template?.metadata;
    const annotations = templateMeta?.annotations as Record<string, string> | undefined;
    const hasKey =
      annotations != null && typeof annotations === 'object' && annotations[key] !== undefined;

    const patchOps: JsonPatchOp[] = [];

    if (enabled) {
      if (!templateMeta) {
        patchOps.push({
          op: 'add',
          path: '/spec/template/metadata',
          value: { annotations: { [key]: 'true' } },
        });
      } else if (!annotations || typeof annotations !== 'object') {
        patchOps.push({ op: 'add', path: annPath, value: { [key]: 'true' } });
      } else if (hasKey) {
        patchOps.push({ op: 'replace', path: keyPath, value: 'true' });
      } else {
        patchOps.push({ op: 'add', path: keyPath, value: 'true' });
      }
    } else if (hasKey) {
      patchOps.push({ op: 'remove', path: keyPath });
    } else {
      return;
    }

    await this.customObjectsJsonPatch.patchNamespacedCustomObject(
      {
        group: 'kubevirt.io',
        version: 'v1',
        namespace,
        plural: 'virtualmachines',
        name: vmName,
        body: patchOps,
      },
      'json',
      {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      },
    );
  }

  async patchVirtualMachineInstanceStatus(
    vmiName: string,
    namespace: string,
    conditions: Array<{
      type: string;
      status: string;
      reason?: string;
      message?: string;
      lastTransitionTime?: string;
    }>,
  ): Promise<V1VirtualMachineInstance> {
    try {
      const currentVmi = await this.lifecycle.getVirtualMachineInstance(vmiName, namespace);
      const hasStatus = currentVmi?.status !== undefined;
      const hasConditions = currentVmi?.status?.conditions !== undefined;

      const patchOps: JsonPatchOp[] = [];

      if (!hasStatus) {
        patchOps.push({ op: 'add', path: '/status', value: {} });
      }

      if (!hasConditions) {
        patchOps.push({ op: 'add', path: '/status/conditions', value: [] });
      }

      conditions.forEach((condition) => {
        const now = new Date().toISOString();
        const conditionValue = {
          type: condition.type,
          status: condition.status,
          reason: condition.reason || 'VMStuck',
          message: condition.message || 'Virtual machine stuck in unhealthy state',
          lastTransitionTime: condition.lastTransitionTime || now,
          lastProbeTime: condition.lastTransitionTime || now,
        };

        const conditionsList = currentVmi?.status?.conditions as KubernetesCondition[] | undefined;
        const existingConditionIndex = conditionsList?.findIndex(
          (c: KubernetesCondition) => c.type === condition.type,
        );

        if (existingConditionIndex !== undefined && existingConditionIndex >= 0) {
          patchOps.push({
            op: 'replace',
            path: `/status/conditions/${existingConditionIndex}`,
            value: conditionValue,
          });
        } else {
          patchOps.push({ op: 'add', path: '/status/conditions/-', value: conditionValue });
        }
      });

      try {
        const response = await this.customObjectsJsonPatch.patchNamespacedCustomObjectStatus(
          {
            group: 'kubevirt.io',
            version: 'v1',
            namespace: namespace,
            plural: 'virtualmachineinstances',
            name: vmiName,
            body: patchOps,
            dryRun: undefined,
            fieldManager: undefined,
            fieldValidation: undefined,
          },
          'json',
          { headers: { 'Content-Type': 'application/json-patch+json' } },
        );
        return unwrapPatchResponse(response) as unknown as V1VirtualMachineInstance;
      } catch {
        const response = await this.customObjectsJsonPatch.patchNamespacedCustomObject(
          {
            group: 'kubevirt.io',
            version: 'v1',
            namespace: namespace,
            plural: 'virtualmachineinstances',
            name: vmiName,
            body: patchOps,
            dryRun: undefined,
            fieldManager: undefined,
            fieldValidation: undefined,
          },
          'json',
          { headers: { 'Content-Type': 'application/json-patch+json' } },
        );
        return unwrapPatchResponse(response) as unknown as V1VirtualMachineInstance;
      }
    } catch (error: unknown) {
      const statusCode = getKubeClientHttpStatus(error);
      const statusText = statusCode ? ` (${statusCode})` : '';
      throw new Error(
        `Failed to patch VirtualMachineInstance status${statusText}: ${getErrorMessage(error)}`,
      );
    }
  }

  async patchVmToErrorState(vmName: string, namespace: string): Promise<void> {
    const nonExistentPvcName = `non-existent-pvc-${vmName}-${generateRandomString(
      8,
      'alphanumeric',
    ).toLowerCase()}`;
    const errorVolumeName = 'error-disk';

    const patchBody: JsonPatchOp[] = [
      {
        op: 'add',
        path: '/spec/template/spec/volumes/-',
        value: {
          name: errorVolumeName,
          persistentVolumeClaim: { claimName: nonExistentPvcName },
        },
      },
      {
        op: 'add',
        path: '/spec/template/spec/domain/devices/disks/-',
        value: { name: errorVolumeName, disk: { bus: 'virtio' } },
      },
    ];

    await this.ctx.customObjectsApi.patchNamespacedCustomObject({
      group: 'kubevirt.io',
      version: 'v1',
      namespace,
      plural: 'virtualmachines',
      name: vmName,
      body: patchBody,
    });
  }

  async ensureVmFoldersEnabled(cnvNamespace = 'openshift-cnv'): Promise<KubernetesResource | null> {
    try {
      const cm = await this.secret.getConfigMap('kubevirt-ui-features', cnvNamespace);
      if (!cm) return null;
      const cmData = cm.data as Record<string, string> | undefined;
      if (cmData?.treeViewFolders === 'true') return cm as KubernetesResource;
      const patched = await this.secret.patchConfigMap('kubevirt-ui-features', cnvNamespace, {
        treeViewFolders: 'true',
      });
      return patched as unknown as KubernetesResource;
    } catch {
      return null;
    }
  }

  async enableNodePortFeature(
    enabled = true,
    nodePortAddress?: string,
    cnvNamespace = 'openshift-cnv',
  ): Promise<KubernetesResource> {
    try {
      const patchOps: JsonPatchOp[] = [
        { op: 'replace', path: '/data/nodePortEnabled', value: enabled ? 'true' : 'false' },
      ];

      if (nodePortAddress) {
        patchOps.push({ op: 'replace', path: '/data/nodePortAddress', value: nodePortAddress });
      }

      const response = await this.coreV1JsonPatch.patchNamespacedConfigMap(
        { name: 'kubevirt-ui-features', namespace: cnvNamespace, body: patchOps },
        'json',
        { headers: { 'Content-Type': 'application/json-patch+json' } },
      );

      return unwrapPatchResponse(response);
    } catch (error: unknown) {
      throw new Error(`Failed to enable NodePort feature: ${getErrorMessage(error)}`);
    }
  }
}
