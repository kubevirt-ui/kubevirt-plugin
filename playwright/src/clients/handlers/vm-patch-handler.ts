import type {
  JsonPatchOp,
  KubernetesCondition,
  KubernetesResource,
} from '@/data-models/kubernetes-types';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { generateRandomString } from '@/utils/random-data-generator';

import type { KubernetesHandlerContext } from './kubernetes-api-context';
import type { SecretConfigMapHandler } from './secret-configmap-handler';
import type { VmLifecycleHandler } from './vm-lifecycle-handler';

/** JSON Patch request options (e.g. application/json-patch+json). */
type JsonPatchRequestOptions = {
  headers: Record<string, string>;
};

/** Narrow view of CustomObjectsApi patch overloads used with json-patch content type. */
type CustomObjectsJsonPatchApi = {
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
};

type CoreV1JsonPatchApi = {
  patchNamespacedConfigMap(
    requestParameters: Record<string, unknown>,
    contentType: string,
    options?: Record<string, unknown>,
  ): Promise<unknown>;
};

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

  private get coreV1JsonPatch(): CoreV1JsonPatchApi {
    return this.ctx.coreV1Api as unknown as CoreV1JsonPatchApi;
  }

  private get customObjectsJsonPatch(): CustomObjectsJsonPatchApi {
    return this.ctx.customObjectsApi as unknown as CustomObjectsJsonPatchApi;
  }

  /**
   * Enable or disable SSH NodePort feature in the kubevirt-ui-features ConfigMap.
   * This is a cluster-wide setting that must be enabled before VMs can use SSH over NodePort.
   *
   * @param enabled - Whether to enable (true) or disable (false) the NodePort feature
   * @param nodePortAddress - Optional node address to set for SSH connections
   * @param cnvNamespace - Namespace where the ConfigMap exists (default: 'openshift-cnv')
   * @returns The patched ConfigMap
   * @throws {Error} When patch operation fails
   */
  async enableNodePortFeature(
    enabled = true,
    nodePortAddress?: string,
    cnvNamespace = 'openshift-cnv',
  ): Promise<KubernetesResource> {
    try {
      const patchOps: JsonPatchOp[] = [
        {
          op: 'replace',
          path: '/data/nodePortEnabled',
          value: enabled ? 'true' : 'false',
        },
      ];

      if (nodePortAddress) {
        patchOps.push({
          op: 'replace',
          path: '/data/nodePortAddress',
          value: nodePortAddress,
        });
      }

      const response = await this.coreV1JsonPatch.patchNamespacedConfigMap(
        {
          name: 'kubevirt-ui-features',
          namespace: cnvNamespace,
          body: patchOps,
        },
        'json',
        {
          headers: {
            'Content-Type': 'application/json-patch+json',
          },
        },
      );

      return unwrapPatchResponse(response);
    } catch (error: unknown) {
      throw new Error(`Failed to enable NodePort feature: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Ensure VM folders (tree view) are enabled in the kubevirt-ui-features ConfigMap.
   * If treeViewFolders is not already "true", patches the ConfigMap using the Kubernetes client.
   *
   * @param cnvNamespace - Namespace where the ConfigMap exists (default: 'openshift-cnv')
   * @returns The patched ConfigMap, or null if ConfigMap does not exist or patch was not needed
   */
  async ensureVmFoldersEnabled(cnvNamespace = 'openshift-cnv'): Promise<KubernetesResource | null> {
    try {
      const cm = await this.secret.getConfigMap('kubevirt-ui-features', cnvNamespace);
      if (!cm) {
        return null;
      }
      const cmData = cm.data as Record<string, string> | undefined;
      if (cmData?.treeViewFolders === 'true') {
        return cm as KubernetesResource;
      }
      const patched = await this.secret.patchConfigMap('kubevirt-ui-features', cnvNamespace, {
        treeViewFolders: 'true',
      });
      return patched as unknown as KubernetesResource;
    } catch {
      return null;
    }
  }

  /**
   * Patch a VirtualMachineInstance's status to add conditions that indicate it's stuck/unhealthy.
   * This can trigger warnings like "VirtualMachineStuckOnNode".
   *
   * @param vmiName - Name of the VirtualMachineInstance
   * @param namespace - Namespace where the VMI exists
   * @param conditions - Array of condition objects to add/replace
   * @returns The patched VirtualMachineInstance resource
   * @throws {Error} When patch operation fails
   */
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
  ): Promise<KubernetesResource> {
    try {
      const currentVmi = await this.lifecycle.getVirtualMachineInstance(vmiName, namespace);
      const hasStatus = currentVmi?.status !== undefined;
      const hasConditions = currentVmi?.status?.conditions !== undefined;

      const patchOps: JsonPatchOp[] = [];

      if (!hasStatus) {
        patchOps.push({
          op: 'add',
          path: '/status',
          value: {},
        });
      }

      if (!hasConditions) {
        patchOps.push({
          op: 'add',
          path: '/status/conditions',
          value: [],
        });
      }

      conditions.forEach((condition, _index) => {
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
          patchOps.push({
            op: 'add',
            path: '/status/conditions/-',
            value: conditionValue,
          });
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
          {
            headers: {
              'Content-Type': 'application/json-patch+json',
            },
          },
        );
        return unwrapPatchResponse(response);
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
          {
            headers: {
              'Content-Type': 'application/json-patch+json',
            },
          },
        );
        return unwrapPatchResponse(response);
      }
    } catch (error: unknown) {
      const statusCode = getKubeClientHttpStatus(error);
      const statusText = statusCode ? ` (${statusCode})` : '';
      throw new Error(
        `Failed to patch VirtualMachineInstance status${statusText}: ${getErrorMessage(error)}`,
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
  ): Promise<KubernetesResource> {
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
      return unwrapPatchResponse(response);
    } catch (error: unknown) {
      const statusCode = getKubeClientHttpStatus(error);
      const statusText = statusCode ? ` (${statusCode})` : '';
      throw new Error(
        `Failed to patch VirtualMachine node selector${statusText}: ${getErrorMessage(error)}`,
      );
    }
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
  ): Promise<KubernetesResource> {
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
      return unwrapPatchResponse(response);
    } catch (error: unknown) {
      const statusCode = getKubeClientHttpStatus(error);
      const statusText = statusCode ? ` (${statusCode})` : '';
      throw new Error(
        `Failed to patch VirtualMachine resources${statusText}: ${getErrorMessage(error)}`,
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
  ): Promise<KubernetesResource> {
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
      return unwrapPatchResponse(response);
    } catch (error: unknown) {
      throw new Error(`Failed to patch VirtualMachine run strategy: ${getErrorMessage(error)}`);
    }
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

    const vm = (await this.lifecycle.getVirtualMachine(vmName, namespace)) as KubernetesResource;
    const spec = vm.spec as Record<string, unknown> | undefined;
    const template = spec?.template as Record<string, unknown> | undefined;
    const templateMeta = template?.metadata as KubernetesResource['metadata'] | undefined;
    const annotations = templateMeta?.annotations;
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
    model: 'virtio' | 'e1000e',
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
   * Patch a VirtualMachine to induce an error state by adding a volume that references
   * a non-existent PVC. After patching, stop and start the VM so the VMI creation fails.
   *
   * @param vmName - Name of the VirtualMachine
   * @param namespace - Namespace where the VM exists
   */
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
        value: {
          name: errorVolumeName,
          disk: { bus: 'virtio' },
        },
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
}
