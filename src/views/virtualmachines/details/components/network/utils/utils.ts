import { NO_DATA_DASH } from 'src/views/virtualmachines/utils/constants';

import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type NetworkPresentation = {
  iface: V1Interface;
  network: V1Network;
};

export const interfacesTypes = {
  bridge: 'Bridge',
  masquerade: 'Masquerade',
  sriov: 'SR-IOV',
};

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

export const getNetworkInterfaceType = (iface: V1Interface): string => {
  const drive = Object.keys(interfacesTypes).find((ifaceType: string) => iface?.[ifaceType]);
  return drive ?? NO_DATA_DASH;
};

export const getPrintableNetworkInterfaceType = (iface: V1Interface): string =>
  interfacesTypes[getNetworkInterfaceType(iface)];
