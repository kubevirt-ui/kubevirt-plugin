import {
  V1AccessCredential,
  V1Bootloader,
  V1CPU,
  V1DataVolumeTemplateSpec,
  V1Devices,
  V1Disk,
  V1DomainSpec,
  V1Features,
  V1InstancetypeMatcher,
  V1Interface,
  V1PreferenceMatcher,
  V1VirtualMachine,
  V1VirtualMachineCondition,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DYNAMIC_CREDENTIALS_SUPPORT } from '@kubevirt-utils/components/DynamicSSHKeyInjection/constants/constants';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getAnnotation, getLabel } from '@kubevirt-utils/resources/shared';
import { WORKLOADS } from '@kubevirt-utils/resources/template';
import { isVM } from '@kubevirt-utils/utils/typeGuards';

import { VM_WORKLOAD_ANNOTATION } from './annotations';
import { UPDATE_STRATEGIES, VirtualMachineStatusConditionTypes } from './constants';

/**
 * A selector for the virtual machine's networks
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine networks
 */
export const getNetworks = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.networks;

/**
 * A selector for the virtual machine's interfaces
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns {V1Interface[]} the virtual machine interfaces
 */
export const getInterfaces = (vm: V1VirtualMachine): V1Interface[] =>
  vm?.spec?.template?.spec?.domain?.devices?.interfaces;

/**
 * A selector for a specific interface on the virtual machine
 * @param {V1VirtualMachine} vm the virtual machine
 * @param {string} ifaceName the name of the interface
 * @returns {V1Interface} the requested interface
 */
export const getInterface = (vm: V1VirtualMachine, ifaceName: string): V1Interface =>
  getInterfaces(vm)?.find((iface) => iface?.name === ifaceName);

/**
 * A selector for the virtual machine's disks
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine disks
 */
export const getDisks = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.domain?.devices?.disks;

/**
 * A selector for the virtual machine's volumes
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine volumes
 */
export const getVolumes = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.volumes;

/**
 * A selector for the virtual machine's GPUs
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine GPUs
 */
export const getGPUDevices = (vm: V1VirtualMachine) =>
  vm?.spec?.template?.spec?.domain?.devices?.gpus || [];

/**
 * A selector for the virtual machine's host devices
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine host devices
 */
export const getHostDevices = (vm: V1VirtualMachine) =>
  vm?.spec?.template?.spec?.domain?.devices?.hostDevices || [];

/**
 * A selector for the virtual machine's volumes snapshot statuses
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine volumes snapshot statuses
 */
export const getVolumeSnapshotStatuses = (vm: V1VirtualMachine) =>
  vm?.status?.volumeSnapshotStatuses;

/**
 * A selector for the virtual machine's data volumes templates
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine host devices
 */
export const getDataVolumeTemplates = (vm: V1VirtualMachine) => vm?.spec?.dataVolumeTemplates || [];

/**
 * A selector for the virtual machine's root data volume
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine's root data volume
 */
export const getRootDataVolume = (vm: V1VirtualMachine): V1Volume =>
  getVolumes(vm)?.find((v) => v.name === ROOTDISK);

/**
 * A selector for the virtual machine's root data volume template spec
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine's root data volume template spec
 */
export const getRootDataVolumeTemplateSpec = (vm: V1VirtualMachine): V1DataVolumeTemplateSpec => {
  const volume = getVolumes(vm)?.find((v) => v.name === ROOTDISK);

  return vm.spec.dataVolumeTemplates?.find((dv) => dv.metadata.name === volume?.dataVolume?.name);
};

/**
 * A selector for the virtual machine's root data volume secretRef
 * @param {V1VirtualMachine} vm
 * @returns the virtual machine's root data volume secretRef
 */
export const getRootDiskSecretRef = (vm: V1VirtualMachine): string => {
  const dataVolumeTemplateSpec = getRootDataVolumeTemplateSpec(vm);
  return dataVolumeTemplateSpec?.spec?.source?.registry?.secretRef;
};

/**
 * A selector for the virtual machine's config maps
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine config maps
 */
export const getConfigMaps = (vm: V1VirtualMachine) =>
  (getVolumes(vm) || []).filter((volume) => volume.configMap);

/**
 * A selector for the virtual machine's secrets
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine secrets
 */
export const getSecrets = (vm: V1VirtualMachine) =>
  (getVolumes(vm) || []).filter((volume) => volume.secret);

/**
 * A selector for the virtual machine's service accounts
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine service accounts
 */
export const getServiceAccounts = (vm: V1VirtualMachine) =>
  (getVolumes(vm) || []).filter((volume) => volume.serviceAccount);

/**
 * A selector for the virtual machine's nodeSelector
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine nodeSelector
 */
export const getNodeSelector = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.nodeSelector;

/**
 * A selector for the virtual machine's tolerations
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine tolerations
 */
export const getTolerations = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.tolerations;

/**
 * A selector for the virtual machine's affinity
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine affinity
 */
export const getAffinity = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.affinity;

/**
 * A selector for the virtual machine's boot disk.
 * If disks with bootOrder are available, returns the disk with lowest bootOrder integer value.
 * If not, returns the first disk
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine boot disk
 */
export const getBootDisk = (vm: V1VirtualMachine): V1Disk => {
  const disks = getDisks(vm);
  const isInstanceTypeVM = Boolean(getInstanceTypeMatcher(vm));

  const rootDiskVolume = (getVolumes(vm) || []).find((volume) => volume.name === ROOTDISK);

  const defaultRootDisk =
    isInstanceTypeVM && Boolean(rootDiskVolume) ? { name: ROOTDISK } : disks?.[0];

  return (disks || [])
    .filter((d) => d.bootOrder)
    .reduce((acc, disk) => {
      return acc.bootOrder < disk.bootOrder ? acc : disk;
    }, defaultRootDisk);
};

/**
 * A selector for the QEMU machine type
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns {string} the machine type
 */
export const getMachineType = (vm: V1VirtualMachine): string =>
  vm?.spec?.template?.spec?.domain?.machine?.type;

/**
 * A selector that returns the workload of a given virtual machine
 * @param {V1VirtualMachine} vm the virtual machine
 */
export const getWorkload = (vm: V1VirtualMachine): WORKLOADS =>
  getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) as WORKLOADS;

/**
 * A selector that returns the VM accessCredentials array
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns {V1AccessCredential[]} an array of access credential object
 */
export const getAccessCredentials = (vm: V1VirtualMachine): V1AccessCredential[] =>
  vm?.spec?.template?.spec?.accessCredentials;

export const getIsDynamicSSHInjectionEnabled = (
  vm: V1VirtualMachine,
  bootableVolume?: BootableVolume,
): boolean =>
  getLabel(bootableVolume || vm, DYNAMIC_CREDENTIALS_SUPPORT) === 'true' &&
  Boolean(getAccessCredentials(vm)?.[0]?.sshPublicKey?.propagationMethod?.qemuGuestAgent);

/**
 * A selector that finds the SSH secret name of the VM
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns {string} the name of secret resource
 */
export const getVMSSHSecretName = (vm: V1VirtualMachine): string =>
  getAccessCredentials(vm)?.find((ac) => ac?.sshPublicKey?.source?.secret?.secretName)?.sshPublicKey
    ?.source?.secret?.secretName;

/**
 * A selector that returns the autoAttachPodInterface of the VM
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns {boolean} the autoAttachPodInterface
 */
export const getAutoAttachPodInterface = (vm: V1VirtualMachine): boolean =>
  vm?.spec?.template?.spec?.domain?.devices?.autoattachPodInterface;

export const getDomain = <T extends Record<string, any>>(obj: T): V1DomainSpec =>
  obj?.spec?.domain || obj?.spec?.template?.spec?.domain;

export const getMemory = <T>(obj: T): string =>
  getDomain(obj)?.memory?.guest || getDomain(obj)?.resources?.requests?.['memory'];

export const getCPU = <T>(obj: T): V1CPU => getDomain(obj)?.cpu;

export const getMemoryCPU = <T>(obj: T): { cpu: V1CPU; memory: string } => ({
  cpu: getCPU(obj),
  memory: getMemory(obj),
});

/**
 * A selector that returns the amount of CPU cores of the resource
 * @param {T} obj resource such as VM or VMI
 * @returns {number} the number of CPU cores
 */
export const getCPUCores = <T>(obj: T): number => getCPU(obj)?.cores || 1;

/**
 * A selector that returns  the amount of CPU sockets of the resource
 * @param {T} obj resource such as VM or VMI
 * @returns {number} the number of CPU sockets
 */
export const getCPUSockets = <T>(obj: T): number => getCPU(obj)?.sockets || 1;

/**
 * A selector that returns the amount of CPU threads of the resource
 * @param {T} obj resource such as VM or VMI
 * @returns {number} the number of CPU threads
 */
export const getCPUThreads = <T>(obj: T): number => getCPU(obj)?.threads || 1;

/**
 * A selector that returns virtual machine evictionStrategy
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns {string} the evictionStrategy
 */
export const getEvictionStrategy = (vm: V1VirtualMachine): string =>
  vm?.spec?.template?.spec?.evictionStrategy;

export const getDevices = (vm: V1VirtualMachine): V1Devices =>
  vm?.spec?.template?.spec?.domain?.devices;

export const getDomainFeatures = (vm: V1VirtualMachine): V1Features =>
  vm?.spec?.template?.spec?.domain?.features;

export const getBootloader = (vm: V1VirtualMachine): V1Bootloader =>
  vm?.spec?.template?.spec?.domain?.firmware?.bootloader;

export const getHostname = (vm: V1VirtualMachine): string => vm?.spec?.template?.spec?.hostname;

export const getInstanceTypeMatcher = (vm: V1VirtualMachine): V1InstancetypeMatcher =>
  vm?.spec?.instancetype;

export const getPreferenceMatcher = (vm: V1VirtualMachine): V1PreferenceMatcher =>
  vm?.spec?.preference;

/**
 * A selector that returns the VM's status conditions
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns {V1VirtualMachineCondition[]} the VM's status conditions
 */
export const getStatusConditions = (vm: V1VirtualMachine): V1VirtualMachineCondition[] =>
  vm?.status?.conditions;

export const getStatusConditionByType = (
  vm: V1VirtualMachine,
  conditionType: VirtualMachineStatusConditionTypes,
): V1VirtualMachineCondition =>
  vm?.status?.conditions?.find((condition) => condition.type === conditionType);

export const getUpdateStrategy = (vm: V1VirtualMachine): UPDATE_STRATEGIES =>
  vm?.spec?.updateVolumesStrategy as UPDATE_STRATEGIES;

export const isHeadlessMode = (vm: V1VirtualMachine | V1VirtualMachineInstance) => {
  const devices = isVM(vm) ? vm?.spec?.template?.spec?.domain?.devices : vm?.spec?.domain?.devices;
  return devices?.autoattachGraphicsDevice === false;
};
