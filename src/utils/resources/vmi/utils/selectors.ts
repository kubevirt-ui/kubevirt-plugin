import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
/**
 * A selector for the virtual machine instance's volumes
 * @param {V1VirtualMachineInstance} vmi the virtual machine instance
 * @returns the virtual machine instance volumes
 */
export const getVMIVolumes = (vmi: V1VirtualMachineInstance) => vmi?.spec?.volumes;

/**
 * A selector for the virtual machine instance's networks
 * @param {V1VirtualMachineInstance} vmi the virtual machine
 * @returns the virtual machine instance networks
 */
export const getVMINetworks = (vmi: V1VirtualMachineInstance) => vmi?.spec?.networks;

/**
 * A selector for the virtual machine instance's interfaces
 * @param {V1VirtualMachineInstance} vmi the virtual machine
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
