import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
/**
 * A selector for the virtual machine's volumes
 * @param {V1VirtualMachineInstance} vmi the virtual machine instance
 * @returns the virtual machine instance volumes
 */
export const getVMIVolumes = (vmi: V1VirtualMachineInstance) => vmi?.spec?.volumes;
