import { V1AccessCredential, V1Disk, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DYNAMIC_CREDENTIALS_SUPPORT } from '@kubevirt-utils/components/DynamicSSHKeyInjection/constants/constants';
import { getAnnotation, getLabel } from '@kubevirt-utils/resources/shared';

import { VM_WORKLOAD_ANNOTATION } from './annotations';

/**
 * A selector for the virtual machine's networks
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine networks
 */
export const getNetworks = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.networks;

/**
 * A selector for the virtual machine's interfaces
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine interfaces
 */
export const getInterfaces = (vm: V1VirtualMachine) =>
  vm?.spec?.template?.spec?.domain?.devices?.interfaces;

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
export const getDataVolumeTemplates = (vm: V1VirtualMachine) => vm?.spec?.dataVolumeTemplates;

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
export const getBootDisk = (vm: V1VirtualMachine): V1Disk =>
  (getDisks(vm) || [])
    .filter((d) => d.bootOrder)
    .reduce((acc, disk) => {
      return acc.bootOrder < disk.bootOrder ? acc : disk;
    }, getDisks(vm)?.[0]);

/**
 * A selector for the QEMU machine's type
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns {string} the machine type
 */
export const getMachineType = (vm: V1VirtualMachine): string =>
  vm?.spec?.template?.spec?.domain?.machine?.type;

/**
 * A selector that returns the workload of a given virtual machine
 * @param {V1VirtualMachine} vm the virtual machine
 */
export const getWorkload = (vm: V1VirtualMachine): string =>
  getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION);

/**
 * A selector that returns the VM accessCredentials array
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns {V1AccessCredential[]} an array of access credential object
 */
export const getAccessCredentials = (vm: V1VirtualMachine): V1AccessCredential[] =>
  vm?.spec?.template?.spec?.accessCredentials;

export const getIsDynamicSSHInjectionEnabled = (vm: V1VirtualMachine): boolean =>
  getLabel(vm, DYNAMIC_CREDENTIALS_SUPPORT) === 'true' &&
  Boolean(getAccessCredentials(vm)?.[0]?.sshPublicKey?.propagationMethod?.qemuGuestAgent);

/**
 * A selector that finds the SSH secret name of the VM
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns {string} the name of secret resource
 */
export const getVMSSHSecretName = (vm: V1VirtualMachine): string =>
  getAccessCredentials(vm)?.find((ac) => ac?.sshPublicKey?.source?.secret?.secretName)?.sshPublicKey
    ?.source?.secret?.secretName;
