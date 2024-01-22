import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { IpAddresses } from '@virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabNetworkInterfaces/utils/types';

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
  const trimmedIPAddresses = ipAddresses?.filter((ip) => !isEmpty(ip));
  return [...new Set(trimmedIPAddresses)];
};

export const getVMIIPAddressesWithName = (vmi: V1VirtualMachineInstance): IpAddresses => {
  const namedInterfaces = vmi?.status?.interfaces?.filter((iface) => !!iface.name) || [];
  return namedInterfaces?.reduce((acc, iface) => {
    const ips = [...new Set([iface?.ipAddress, ...(iface?.ipAddresses || [])])];
    if (!isEmpty(ips)) {
      for (const ip of ips) {
        acc.push({ interfaceName: iface?.interfaceName, ip });
      }
    }
    return acc;
  }, [] as IpAddresses);
};
