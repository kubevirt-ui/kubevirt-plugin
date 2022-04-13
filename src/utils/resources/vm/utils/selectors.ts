import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

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
  vm?.spec?.template?.spec?.domain?.devices?.gpus;

/**
 * A selector for the virtual machine's host devices
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine host devices
 */
export const getHostDevices = (vm: V1VirtualMachine) =>
  vm?.spec?.template?.spec?.domain?.devices?.hostDevices;

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
  getVolumes(vm).filter((volume) => volume.configMap);

/**
 * A selector for the virtual machine's secrets
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine secrets
 */
export const getSecrets = (vm: V1VirtualMachine) =>
  getVolumes(vm).filter((volume) => volume.secret);

/**
 * A selector for the virtual machine's service accounts
 * @param {V1VirtualMachine} vm the virtual machine
 * @returns the virtual machine service accounts
 */
export const getServiceAccounts = (vm: V1VirtualMachine) =>
  getVolumes(vm).filter((volume) => volume.serviceAccount);

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
