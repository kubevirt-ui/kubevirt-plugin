import type { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty, removeLinkLocalIPV6 } from '@kubevirt-utils/utils/utils';
import type { IpAddresses } from '@virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabNetworkInterfaces/utils/types';

import { getVMIStatusInterfaces } from './selectors';

/**
 * Get VMI IPs
 *
 * @param {V1VirtualMachineInstance} vmi - VMI
 * @returns {string[]}
 */
export const getVMIIPAddresses = (vmi: V1VirtualMachineInstance): string[] => [
  ...new Set(getVMIIPAddressesWithName(vmi).map(({ ip: ipAddress }) => ipAddress)),
];

export const getIPAddressesDisplayValue = (vmi: undefined | V1VirtualMachineInstance): string => {
  if (!vmi) {
    return NO_DATA_DASH;
  }

  const ips = getVMIIPAddresses(vmi);
  return isEmpty(ips) ? NO_DATA_DASH : ips.join(', ');
};

export const getVMIIPAddressesWithName = (vmi: V1VirtualMachineInstance): IpAddresses => {
  const namedInterfaces = getVMIStatusInterfaces(vmi)?.filter((iface) => !!iface.name) ?? [];
  return removeLinkLocalIPV6(
    namedInterfaces?.reduce((acc, iface) => {
      const ips = [...new Set([iface?.ipAddress, ...(iface?.ipAddresses ?? [])])].filter(
        (addr) => !isEmpty(addr?.trim()),
      );
      if (!isEmpty(ips)) {
        for (const addr of ips) {
          acc.push({ interfaceName: iface?.interfaceName, ip: addr });
        }
      }
      return acc;
    }, [] as IpAddresses),
  );
};
