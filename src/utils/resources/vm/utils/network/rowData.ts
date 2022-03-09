import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { NetworkPresentation } from './constants';

/**
 * function to get network interfaces row data from networks and interfaces
 * @param {V1Network[]} networks networks
 * @param {V1Interface[]} interfaces networks interfaces
 * @returns returns a network presentation array
 */
export const getNetworkInterfaceRowData = (
  networks: V1Network[],
  interfaces: V1Interface[],
): NetworkPresentation[] => {
  const data: NetworkPresentation[] = interfaces?.map((iface) => {
    const network = networks?.find((net) => net.name === iface.name);
    return {
      iface,
      network,
      metadata: { name: network.name },
    };
  });
  return data || [];
};
