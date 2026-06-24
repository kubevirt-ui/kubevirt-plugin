import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { TestTimeouts } from '@/utils/test-config';
import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/dist/kubevirt/index';

import type { DataVolumeHandler } from './data-volume-handler';
import type { KubernetesHandlerContext } from './kubernetes-api-context';
import type { SecretConfigMapHandler } from './secret-configmap-handler';
import type { TemplateHandler } from './template-handler';
import { VmDiskQueryHandler } from './vm-disk-query-handler';
import { VmLifecycleHandler } from './vm-lifecycle-handler';
import { VmPatchHandler } from './vm-patch-handler';

/**
 * Facade preserving `client.vm.*` API; implementation is split across lifecycle, patch, and disk/query handlers.
 */
export class VirtualMachineHandler {
  private readonly lifecycle: VmLifecycleHandler;
  private readonly patch: VmPatchHandler;
  private readonly diskQuery: VmDiskQueryHandler;

  constructor(
    ctx: KubernetesHandlerContext,
    template: TemplateHandler,
    dataVolume: DataVolumeHandler,
    secret: SecretConfigMapHandler,
  ) {
    this.lifecycle = new VmLifecycleHandler(ctx, template);
    this.patch = new VmPatchHandler(ctx, this.lifecycle, secret);
    this.diskQuery = new VmDiskQueryHandler(ctx, dataVolume, this.lifecycle);
  }

  createVmFromTemplate(
    templateMetadataName: string,
    vmName: string,
    namespace: string,
    templateNamespace = 'openshift',
    startAfterCreation = true,
    sysprepConfigMapName?: string,
    cloudInitConfig?: {
      username?: string;
      password?: string;
    },
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
  ) {
    return this.lifecycle.createVmFromTemplate(
      templateMetadataName,
      vmName,
      namespace,
      templateNamespace,
      startAfterCreation,
      sysprepConfigMapName,
      cloudInitConfig,
      vmCustomization,
      storageClassName,
      folderName,
    );
  }

  createVmFromInstanceType(
    volumeName: string,
    vmName: string,
    namespace: string,
    series = 'U series',
    instanceTypeSize = 'small',
    startAfterCreation = true,
    volumeNamespace = 'openshift-virtualization-os-images',
    storageClassName?: string,
    rootDiskName = 'rootdisk',
  ) {
    return this.lifecycle.createVmFromInstanceType(
      volumeName,
      vmName,
      namespace,
      series,
      instanceTypeSize,
      startAfterCreation,
      volumeNamespace,
      storageClassName,
      rootDiskName,
    );
  }

  getVirtualMachine(vmName: string, namespace: string) {
    return this.lifecycle.getVirtualMachine(vmName, namespace);
  }

  getVirtualMachineInstance(vmName: string, namespace: string) {
    return this.lifecycle.getVirtualMachineInstance(vmName, namespace);
  }

  cloneVirtualMachine(
    sourceVmName: string,
    targetVmName: string,
    namespace: string,
    startAfterClone = false,
    timeoutMs: number = TestTimeouts.VM_CREATION,
  ) {
    return this.lifecycle.cloneVirtualMachine(
      sourceVmName,
      targetVmName,
      namespace,
      startAfterClone,
      timeoutMs,
    );
  }

  waitForVmCloneSucceeded(cloneName: string, namespace: string, timeoutMs = 120000) {
    return this.lifecycle.waitForVmCloneSucceeded(cloneName, namespace, timeoutMs);
  }

  waitForVmExists(vmName: string, namespace: string, timeoutMs = 120000): Promise<boolean> {
    return this.lifecycle.waitForVmExists(vmName, namespace, timeoutMs);
  }

  waitForVmRunning(vmName: string, namespace: string, timeoutMs = 300000): Promise<boolean> {
    return this.lifecycle.waitForVmRunning(vmName, namespace, timeoutMs);
  }

  startVirtualMachine(vmName: string, namespace: string) {
    return this.lifecycle.startVirtualMachine(vmName, namespace);
  }

  disableDeleteProtection(vmName: string, namespace: string) {
    return this.lifecycle.disableDeleteProtection(vmName, namespace);
  }

  getVmIpAddress(vmName: string, namespace: string): Promise<null | string> {
    return this.diskQuery.getVmIpAddress(vmName, namespace);
  }

  getVmiCpuSockets(vmName: string, namespace: string): Promise<null | string> {
    return this.diskQuery.getVmiCpuSockets(vmName, namespace);
  }

  getVmiMemoryGuest(vmName: string, namespace: string): Promise<null | string> {
    return this.diskQuery.getVmiMemoryGuest(vmName, namespace);
  }

  getVmiDiskBus(vmName: string, namespace: string, diskName: string): Promise<null | string> {
    return this.diskQuery.getVmiDiskBus(vmName, namespace, diskName);
  }

  getVmiFilesystemList(vmName: string, namespace: string) {
    return this.diskQuery.getVmiFilesystemList(vmName, namespace);
  }

  patchVirtualMachineResources(
    vmName: string,
    namespace: string,
    resources: {
      cpuSockets?: number;
      cpuCores?: number;
      memory?: string;
    },
  ) {
    return this.patch.patchVirtualMachineResources(vmName, namespace, resources);
  }

  patchVirtualMachineNodeSelector(
    vmName: string,
    namespace: string,
    nodeSelector: { [key: string]: string },
  ) {
    return this.patch.patchVirtualMachineNodeSelector(vmName, namespace, nodeSelector);
  }

  patchVirtualMachineRunStrategy(
    vmName: string,
    namespace: string,
    runStrategy: 'Always' | 'Manual' | 'RerunOnFailure',
  ) {
    return this.patch.patchVirtualMachineRunStrategy(vmName, namespace, runStrategy);
  }

  patchVmEvictionStrategy(
    vmName: string,
    namespace: string,
    evictionStrategy: 'LiveMigrate' | 'None',
  ) {
    return this.patch.patchVmEvictionStrategy(vmName, namespace, evictionStrategy);
  }

  patchVmNetworkInterfaceModel(
    vmName: string,
    namespace: string,
    model: 'e1000e' | 'virtio',
    interfaceIndex = 0,
  ): Promise<void> {
    return this.patch.patchVmNetworkInterfaceModel(vmName, namespace, model, interfaceIndex);
  }

  patchVmDeschedulerEvictAnnotation(
    vmName: string,
    namespace: string,
    enabled: boolean,
  ): Promise<void> {
    return this.patch.patchVmDeschedulerEvictAnnotation(vmName, namespace, enabled);
  }

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
  ) {
    return this.patch.patchVirtualMachineInstanceStatus(vmiName, namespace, conditions);
  }

  enableSshAccess(
    vmName: string,
    namespace: string,
    sshServiceType: 'LoadBalancer' | 'NodePort' = 'NodePort',
  ) {
    return this.diskQuery.enableSshAccess(vmName, namespace, sshServiceType);
  }

  ensureVmFoldersEnabled(cnvNamespace = 'openshift-cnv'): Promise<KubernetesResource | null> {
    return this.patch.ensureVmFoldersEnabled(cnvNamespace);
  }

  enableNodePortFeature(enabled = true, nodePortAddress?: string, cnvNamespace = 'openshift-cnv') {
    return this.patch.enableNodePortFeature(enabled, nodePortAddress, cnvNamespace);
  }

  listVirtualMachines(namespace: string) {
    return this.diskQuery.listVirtualMachines(namespace);
  }

  verifyVmCreated(
    vmName: string,
    namespace: string,
    timeoutMs = 30000,
  ): Promise<{
    error?: string;
    exists: boolean;
    vm?: V1VirtualMachine;
  }> {
    return this.diskQuery.verifyVmCreated(vmName, namespace, timeoutMs);
  }

  stopVm(vmName: string, namespace: string): Promise<boolean> {
    return this.lifecycle.stopVm(vmName, namespace);
  }

  startVm(vmName: string, namespace: string): Promise<boolean> {
    return this.lifecycle.startVm(vmName, namespace);
  }

  patchVmToErrorState(vmName: string, namespace: string): Promise<void> {
    return this.patch.patchVmToErrorState(vmName, namespace);
  }

  addCdromDiskToVm(
    vmName: string,
    namespace: string,
    options?: { volumeName?: string; pvcClaimName?: string; containerImage?: string },
  ): Promise<void> {
    return this.diskQuery.addCdromDiskToVm(vmName, namespace, options);
  }

  waitForVmError(vmName: string, namespace: string, timeoutMs = 120000): Promise<boolean> {
    return this.diskQuery.waitForVmError(vmName, namespace, timeoutMs);
  }

  addBlankDiskToVm(
    vmName: string,
    namespace: string,
    diskName: string,
    size = '1Gi',
  ): Promise<void> {
    return this.diskQuery.addBlankDiskToVm(vmName, namespace, diskName, size);
  }

  waitForVmDiskPresent(
    vmName: string,
    namespace: string,
    diskName: string,
    timeoutMs: number = TestTimeouts.VM_CREATION,
  ): Promise<void> {
    return this.diskQuery.waitForVmDiskPresent(vmName, namespace, diskName, timeoutMs);
  }

  hotplugVolumeToVm(
    vmName: string,
    namespace: string,
    diskName: string,
    dataVolumeName: string,
  ): Promise<void> {
    return this.diskQuery.hotplugVolumeToVm(vmName, namespace, diskName, dataVolumeName);
  }

  isVmDiskPersistent(vmName: string, namespace: string, diskName: string): Promise<boolean> {
    return this.diskQuery.isVmDiskPersistent(vmName, namespace, diskName);
  }

  vmExists(vmName: string, namespace: string): Promise<boolean> {
    return this.lifecycle.vmExists(vmName, namespace);
  }

  waitForVmDeleted(vmName: string, namespace: string, timeoutMs = 60000): Promise<boolean> {
    return this.lifecycle.waitForVmDeleted(vmName, namespace, timeoutMs);
  }

  verifyVmFolderAndVmsDeleted(
    vmNames: string[],
    folderName: string,
    namespace: string,
    timeoutMs = 60000,
  ): Promise<{
    folderDeleted: boolean;
    vmsDeleted: { [vmName: string]: boolean };
    allDeleted: boolean;
    errors?: string[];
  }> {
    return this.diskQuery.verifyVmFolderAndVmsDeleted(vmNames, folderName, namespace, timeoutMs);
  }

  verifyFolderDeleted(
    folderName: string,
    namespace: string,
    timeoutMs: number = TestTimeouts.CLUSTER_OPERATION,
  ): Promise<{
    folderDeleted: boolean;
    errors?: string[];
  }> {
    return this.diskQuery.verifyFolderDeleted(folderName, namespace, timeoutMs);
  }

  verifyVmHasSSHKey(
    vmName: string,
    namespace: string,
  ): Promise<{ hasSSHKey: boolean; secretName?: string }> {
    return this.diskQuery.verifyVmHasSSHKey(vmName, namespace);
  }

  /**
   * Verifies the VM spec JSON contains (or excludes) a substring.
   */
  async verifyVmSpecContains(
    expectedText: string,
    shouldContain = true,
    vmName: string,
    namespace: string,
  ): Promise<boolean> {
    try {
      const vm = await this.getVirtualMachine(vmName, namespace);
      const specString = JSON.stringify(vm.spec ?? {});
      const contains = specString.includes(expectedText);
      return shouldContain ? contains : !contains;
    } catch {
      return false;
    }
  }

  removeVmDeleteProtection(vmName: string, namespace: string): Promise<boolean> {
    return this.lifecycle.removeVmDeleteProtection(vmName, namespace);
  }
}
