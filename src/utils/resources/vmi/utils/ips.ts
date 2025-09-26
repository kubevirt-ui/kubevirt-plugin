import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty, removeLinkLocalIPV6 } from '@kubevirt-utils/utils/utils';
import { IpAddresses } from '@virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabNetworkInterfaces/utils/types';

/**
 * Get VMI IPs
 *
 * @param {V1VirtualMachineInstance} vmi - VMI
 * @returns {string[]}
 */
export const getVMIIPAddresses = (vmi: V1VirtualMachineInstance): string[] => [
  ...new Set(getVMIIPAddressesWithName(vmi).map(({ ip }) => ip)),
];

export const getVMIIPAddressesWithName = (vmi: V1VirtualMachineInstance): IpAddresses => {
  const namedInterfaces = vmi?.status?.interfaces?.filter((iface) => !!iface.name) || [];
  return removeLinkLocalIPV6(
    namedInterfaces?.reduce((acc, iface) => {
      const ips = [...new Set([iface?.ipAddress, ...(iface?.ipAddresses || [])])].filter(
        (ip) => !isEmpty(ip?.trim()),
      );
      if (!isEmpty(ips)) {
        for (const ip of ips) {
          acc.push({ interfaceName: iface?.interfaceName, ip });
        }
      }
      return acc;
    }, [] as IpAddresses),
  );
};
