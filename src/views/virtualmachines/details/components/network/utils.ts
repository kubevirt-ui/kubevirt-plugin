import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { NetworkInterfaceRowProps } from './NetworkInterfaceRow';

export const getNetworkInterfaceRowData = (networks: V1Network[], interfaces: V1Interface[]) => {
  const data: NetworkInterfaceRowProps[] = interfaces?.map((iface) => {
    const network = networks?.find((net) => net.name === iface.name);
    return {
      iface,
      network,
    };
  });
  return data;
};
