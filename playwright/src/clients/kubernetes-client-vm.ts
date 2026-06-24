import type { KubernetesResource } from '@/data-models/kubernetes-types';
import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/dist/kubevirt/index';

export interface KubernetesClientVmMethods {
  getClusterVirtualMachineCount(): Promise<number>;
  createVmFromTemplate(
    templateMetadataName: string,
    vmName: string,
    namespace: string,
    templateNamespace?: string,
    startAfterCreation?: boolean,
    sysprepConfigMapName?: string,
    cloudInitConfig?: { username?: string; password?: string },
    vmCustomization?: {
      description?: string;
      cpu?: number;
      memory?: number;
      bootMode?: 'BIOS' | 'UEFI (secure)' | 'UEFI';
      workload?: string;
      hostname?: string;
      headless?: boolean;
    },
    storageClassName?: string,
    folderName?: string,
  ): Promise<V1VirtualMachine>;
  createVmFromInstanceType(
    volumeName: string,
    vmName: string,
    namespace: string,
    series?: string,
    instanceTypeSize?: string,
    startAfterCreation?: boolean,
    volumeNamespace?: string,
    storageClassName?: string,
    rootDiskName?: string,
  ): Promise<V1VirtualMachine>;
  getVirtualMachine(vmName: string, namespace: string): Promise<V1VirtualMachine>;
  getVirtualMachineInstance(vmName: string, namespace: string): Promise<KubernetesResource>;
  cloneVirtualMachine(
    sourceVmName: string,
    targetVmName: string,
    namespace: string,
    startAfterClone?: boolean,
    timeoutMs?: number,
  ): Promise<KubernetesResource>;
  waitForVmCloneSucceeded(
    cloneName: string,
    namespace: string,
    timeoutMs?: number,
  ): Promise<KubernetesResource>;
  waitForVmExists(vmName: string, namespace: string, timeoutMs?: number): Promise<boolean>;
  waitForVmRunning(vmName: string, namespace: string, timeoutMs?: number): Promise<boolean>;
  startVirtualMachine(vmName: string, namespace: string): Promise<KubernetesResource>;
  disableDeleteProtection(vmName: string, namespace: string): Promise<KubernetesResource>;
  getVmIpAddress(vmName: string, namespace: string): Promise<null | string>;
  getVmiCpuSockets(vmName: string, namespace: string): Promise<null | string>;
  getVmiMemoryGuest(vmName: string, namespace: string): Promise<null | string>;
  getVmiDiskBus(vmName: string, namespace: string, diskName: string): Promise<null | string>;
  getVmiFilesystemList(vmName: string, namespace: string): Promise<KubernetesResource>;
  patchVirtualMachineResources(
    vmName: string,
    namespace: string,
    resources: { cpuSockets?: number; cpuCores?: number; memory?: string },
  ): Promise<KubernetesResource>;
  patchVirtualMachineNodeSelector(
    vmName: string,
    namespace: string,
    nodeSelector: { [key: string]: string },
  ): Promise<KubernetesResource>;
  patchVirtualMachineRunStrategy(
    vmName: string,
    namespace: string,
    runStrategy: 'Always' | 'Manual' | 'RerunOnFailure',
  ): Promise<KubernetesResource>;
  patchVmEvictionStrategy(
    vmName: string,
    namespace: string,
    evictionStrategy: 'LiveMigrate' | 'None',
  ): Promise<KubernetesResource>;
  patchVmDeschedulerEvictAnnotation(
    vmName: string,
    namespace: string,
    enabled: boolean,
  ): Promise<void>;
  patchVirtualMachineInstanceStatus(
    vmiName: string,
    namespace: string,
    conditions: Array<{
      type: string;
      status: string;
      reason?: string;
      message?: string;
      lastTransitionTime?: string;
    }>,
  ): Promise<KubernetesResource>;
  enableSshAccess(
    vmName: string,
    namespace: string,
    sshServiceType?: 'LoadBalancer' | 'NodePort',
  ): Promise<KubernetesResource>;
  ensureVmFoldersEnabled(cnvNamespace?: string): Promise<KubernetesResource | null>;
  enableNodePortFeature(
    enabled?: boolean,
    nodePortAddress?: string,
    cnvNamespace?: string,
  ): Promise<KubernetesResource>;
  listVirtualMachines(namespace: string): Promise<V1VirtualMachine[]>;
  verifyVmCreated(
    vmName: string,
    namespace: string,
    timeoutMs?: number,
  ): Promise<{ error?: string; exists: boolean; vm?: V1VirtualMachine }>;
  stopVm(vmName: string, namespace: string): Promise<boolean>;
  startVm(vmName: string, namespace: string): Promise<boolean>;
  patchVmToErrorState(vmName: string, namespace: string): Promise<void>;
  addCdromDiskToVm(
    vmName: string,
    namespace: string,
    options?: { volumeName?: string; pvcClaimName?: string; containerImage?: string },
  ): Promise<void>;
  waitForVmError(vmName: string, namespace: string, timeoutMs?: number): Promise<boolean>;
  addBlankDiskToVm(
    vmName: string,
    namespace: string,
    diskName: string,
    size?: string,
  ): Promise<void>;
  waitForVmDiskPresent(
    vmName: string,
    namespace: string,
    diskName: string,
    timeoutMs?: number,
  ): Promise<void>;
  hotplugVolumeToVm(
    vmName: string,
    namespace: string,
    diskName: string,
    dataVolumeName: string,
  ): Promise<void>;
  isVmDiskPersistent(vmName: string, namespace: string, diskName: string): Promise<boolean>;
  vmExists(vmName: string, namespace: string): Promise<boolean>;
  waitForVmDeleted(vmName: string, namespace: string, timeoutMs?: number): Promise<boolean>;
  verifyVmFolderAndVmsDeleted(
    vmNames: string[],
    folderName: string,
    namespace: string,
    timeoutMs?: number,
  ): Promise<{
    folderDeleted: boolean;
    vmsDeleted: { [vmName: string]: boolean };
    allDeleted: boolean;
    errors?: string[];
  }>;
  verifyFolderDeleted(
    folderName: string,
    namespace: string,
    timeoutMs?: number,
  ): Promise<{ folderDeleted: boolean; errors?: string[] }>;
  verifyVmSpecContains(
    expectedText: string,
    shouldContain: boolean,
    vmName: string,
    namespace: string,
  ): Promise<boolean>;
  verifyVmHasSSHKey(
    vmName: string,
    namespace: string,
  ): Promise<{ hasSSHKey: boolean; secretName?: string }>;
  removeVmDeleteProtection(vmName: string, namespace: string): Promise<boolean>;
}

type HandlerMap = Record<string, Record<string, (...args: unknown[]) => unknown>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- prototype delegation requires dynamic property assignment
function delegateTo(proto: any, handler: string, methods: string[]) {
  for (const method of methods) {
    proto[method] = function (this: HandlerMap, ...args: unknown[]) {
      return this[handler][method](...args);
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- applies mixin methods to class prototype
export function applyVmDelegations(proto: any): void {
  delegateTo(proto, 'vm', [
    'createVmFromTemplate',
    'createVmFromInstanceType',
    'getVirtualMachine',
    'getVirtualMachineInstance',
    'cloneVirtualMachine',
    'waitForVmCloneSucceeded',
    'waitForVmExists',
    'waitForVmRunning',
    'startVirtualMachine',
    'disableDeleteProtection',
    'getVmIpAddress',
    'getVmiCpuSockets',
    'getVmiMemoryGuest',
    'getVmiDiskBus',
    'getVmiFilesystemList',
    'patchVirtualMachineResources',
    'patchVirtualMachineNodeSelector',
    'patchVirtualMachineRunStrategy',
    'patchVmEvictionStrategy',
    'patchVmDeschedulerEvictAnnotation',
    'patchVirtualMachineInstanceStatus',
    'enableSshAccess',
    'ensureVmFoldersEnabled',
    'enableNodePortFeature',
    'listVirtualMachines',
    'verifyVmCreated',
    'stopVm',
    'startVm',
    'patchVmToErrorState',
    'addCdromDiskToVm',
    'waitForVmError',
    'addBlankDiskToVm',
    'waitForVmDiskPresent',
    'hotplugVolumeToVm',
    'isVmDiskPersistent',
    'vmExists',
    'waitForVmDeleted',
    'verifyVmFolderAndVmsDeleted',
    'verifyFolderDeleted',
    'verifyVmSpecContains',
    'verifyVmHasSSHKey',
    'removeVmDeleteProtection',
  ]);

  proto.getClusterVirtualMachineCount = async function (this: HandlerMap): Promise<number> {
    const self = this as unknown as KubernetesClientVmMethods & {
      getNamespaces(): Promise<string[]>;
    };
    const namespaces = await self.getNamespaces();
    let total = 0;
    for (const ns of namespaces) {
      const vms = await self.listVirtualMachines(ns);
      total += vms.length;
    }
    return total;
  };
}
