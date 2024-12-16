import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { DEFAULT_NETWORK, DEFAULT_NETWORK_INTERFACE } from '../constants';

import { NetworkPresentation } from './constants';

/**
 * function to get network interfaces row data from networks and interfaces
 * @param {V1Network[]} networks networks
 * @param {V1Interface[]} interfaces networks interfaces
 * @param autoattachPodInterface
 * @returns returns a network presentation array
 */
export const getNetworkInterfaceRowData = (
  networks: V1Network[],
  interfaces: V1Interface[],
  autoattachPodInterface?: boolean,
): NetworkPresentation[] => {
  const data: NetworkPresentation[] = (interfaces || []).map((iface) => {
    const network = networks?.find((net) => net.name === iface.name);
    return {
      iface,
      metadata: { name: network?.name },
      network,
    };
  });

  if (autoattachPodInterface)
    data.push({
      iface: DEFAULT_NETWORK_INTERFACE,
      metadata: { name: DEFAULT_NETWORK.name },
      network: DEFAULT_NETWORK,
    } as NetworkPresentation);

  return data || [];
};
