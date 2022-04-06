import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

/**
 * Get VMI IPs
 * @date 3/20/2022 - 12:18:23 PM
 *
 * @param {V1VirtualMachineInstance} vmi - VMI
 * @returns {string[]}
 */
export const getVMIIPAddresses = (vmi: V1VirtualMachineInstance): string[] => {
  const namedInterfaces = vmi?.status?.interfaces?.filter((iface) => !!iface.name) || [];
  const ipAddresses = namedInterfaces?.flatMap((iface) => [
    iface?.ipAddress,
    ...(iface?.ipAddresses || []),
  ]);
  const trimmedIPAddresses = ipAddresses?.map((ip) => ip.trim())?.filter((ip) => ip.length > 0);
  return [...new Set(trimmedIPAddresses)];
};
