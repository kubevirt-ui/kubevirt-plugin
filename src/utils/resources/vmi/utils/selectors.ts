import {
  V1Bootloader,
  V1Devices,
  V1VirtualMachineCondition,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceNetworkInterface,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getStatusConditions as getResourceStatusConditions,
  getStatusConditionsByType as getResourceStatusConditionsByType,
} from '@kubevirt-utils/resources/shared';

/**
 * A selector for the virtual machine instance's volumes
 * @param {V1VirtualMachineInstance} vmi the virtual machine instance
 * @returns the virtual machine instance volumes
 */
export const getVMIVolumes = (vmi: V1VirtualMachineInstance) => vmi?.spec?.volumes;

/**
 * A selector for the virtual machine instance's networks
 * @param {V1VirtualMachineInstance} vmi the virtual machine instance
 * @returns the virtual machine instance networks
 */
export const getVMINetworks = (vmi: V1VirtualMachineInstance) => vmi?.spec?.networks;

/**
 * A selector for the virtual machine instance's interfaces
 * @param {V1VirtualMachineInstance} vmi the virtual machine instance
 * @returns the virtual machine instance interfaces
 */
export const getVMIInterfaces = (vmi: V1VirtualMachineInstance) =>
  vmi?.spec?.domain?.devices?.interfaces;

/**
 * A selector that returns the virtual machine instance evictionStrategy
 * @param {V1VirtualMachine} vmi the virtual machine instance
 * @returns {string} the evictionStrategy
 */
export const getEvictionStrategy = (vmi: V1VirtualMachineInstance): string =>
  vmi?.spec?.evictionStrategy;

/**
 * A selector that returns the interfaces listed in the virtual machine
 * instance's status block
 * @param {V1VirtualMachine} vmi the virtual machine instance
 * @returns {V1VirtualMachineInstanceNetworkInterface[]} the interfaces
 * listed in the virtual machine interface's status block
 */
export const getVMIStatusInterfaces = (
  vmi: V1VirtualMachineInstance,
): V1VirtualMachineInstanceNetworkInterface[] => vmi?.status?.interfaces;

export const getVMIDevices = (vmi: V1VirtualMachineInstance): V1Devices =>
  vmi?.spec?.domain?.devices;

export const getVMIBootLoader = (vmi: V1VirtualMachineInstance): V1Bootloader =>
  vmi?.spec?.domain?.firmware.bootloader;

/**
 * A selector for the virtual machine instance's node name
 * @param {V1VirtualMachineInstance} vmi the virtual machine instance
 * @returns {string} the virtual machine instance's node name
 */
export const getVMINodeName = (vmi: V1VirtualMachineInstance): string => vmi?.status?.nodeName;
export const getNetworkInterface = (
  vmi: V1VirtualMachineInstance,
  interfaceName: string,
): undefined | V1VirtualMachineInstanceNetworkInterface =>
  getVMIStatusInterfaces(vmi)?.find((iface) => iface?.name === interfaceName);

export const getNetworkInterfaceState = (
  vm: V1VirtualMachineInstance,
  interfaceName: string,
): string | undefined => getNetworkInterface(vm, interfaceName)?.linkState;

export const getVMIArchitecture = (vmi: V1VirtualMachineInstance): string =>
  vmi?.spec?.architecture;

export const getVMIDisks = (vmi: V1VirtualMachineInstance) => vmi?.spec?.domain?.devices?.disks;

/**
 * A selector that returns the VMI's status conditions
 * @param {V1VirtualMachineInstance} vmi the virtual machine instance
 * @returns {V1VirtualMachineCondition[]} the VMI's status conditions
 */
export const getVMIStatusConditions = (
  vmi: V1VirtualMachineInstance,
): V1VirtualMachineCondition[] => getResourceStatusConditions<V1VirtualMachineCondition>(vmi);

/**
 * A selector that returns a VMI status condition by type
 * @param {V1VirtualMachineInstance} vmi the virtual machine instance
 * @param conditionType - type of the condition
 * @returns the matching condition, if present
 */
export const getVMIStatusConditionByType = (
  vmi: V1VirtualMachineInstance,
  conditionType: string,
): undefined | V1VirtualMachineCondition =>
  getResourceStatusConditionsByType<V1VirtualMachineCondition>(vmi, conditionType);
