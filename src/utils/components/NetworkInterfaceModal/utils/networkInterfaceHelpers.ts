import {
  type V1Disk,
  type V1Interface,
  type V1Network,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDisks, getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import {
  PASST_BINDING_NAME,
  POD_NETWORK,
  UDN_BINDING_NAME,
} from '@kubevirt-utils/resources/vm/utils/constants';
import {
  interfaceLabelsProxy,
  interfaceTypesProxy,
} from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  hasAutoAttachedPodNetwork,
  isPodNetwork,
} from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { type NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { ABSENT } from '@virtualmachines/details/tabs/configuration/network/utils/constants';
import { isRunning } from '@virtualmachines/utils';

export const hasExplicitlyDefinedPodNetwork = (vm: V1VirtualMachine): boolean =>
  getNetworks(vm)?.some(isPodNetwork);

export const podNetworkExists = (vm: V1VirtualMachine): boolean =>
  hasExplicitlyDefinedPodNetwork(vm) || (hasAutoAttachedPodNetwork(vm) && isRunning(vm));

export const isPodNetworkName = (networkName: string): boolean => networkName === POD_NETWORK;

export const getNetworkName = (network: V1Network): string | null => {
  if (network) {
    return isPodNetwork(network) ? POD_NETWORK : network?.multus?.networkName;
  }
  return null;
};

export const markOneInterfaceAbsent = (iface: V1Interface): V1Interface => ({
  ...iface,
  state: ABSENT,
});

export const createNetwork = (nicName: string, networkName: string): V1Network => {
  const network: V1Network = {
    name: nicName,
  };

  if (!isPodNetworkName(networkName) && networkName) {
    network.multus = { networkName };
  } else {
    network.pod = {};
  }

  return network;
};

type CreateInterfaceOptions = {
  interfaceLinkState?: NetworkInterfaceState;
  interfaceMACAddress: string;
  interfaceModel: string;
  interfaceType: string;
  isLegacyPasst?: boolean;
  nicName: string;
};

export const createInterface = ({
  interfaceLinkState,
  interfaceMACAddress,
  interfaceModel,
  interfaceType = interfaceTypesProxy.bridge,
  isLegacyPasst,
  nicName,
}: CreateInterfaceOptions): V1Interface => {
  const resolvedInterfaceProp = interfaceLabelsProxy[interfaceType];
  const isPasst = resolvedInterfaceProp === PASST_BINDING_NAME;
  const isUDN = resolvedInterfaceProp === UDN_BINDING_NAME;

  const createdInterface: V1Interface = {
    macAddress: interfaceMACAddress,
    model: interfaceModel,
    name: nicName,
  };

  if (isPasst && !isLegacyPasst) {
    createdInterface.passtBinding = {};
  } else if (isPasst || isUDN) {
    createdInterface.binding = { name: resolvedInterfaceProp };
  } else {
    createdInterface.state = interfaceLinkState;
    createdInterface[resolvedInterfaceProp] = {};
  }

  return createdInterface;
};

export const getNextBootOrder = (vm: V1VirtualMachine): number => {
  const diskOrders = (getDisks(vm) ?? []).map((disk) => disk.bootOrder ?? 0);
  const ifaceOrders = (getInterfaces(vm) ?? []).map((iface) => iface.bootOrder ?? 0);
  return Math.max(0, ...diskOrders, ...ifaceOrders) + 1;
};

export type NICBootOrderPreparation = {
  disksWithOrder: V1Disk[];
  needsDiskUpdate: boolean;
  nicBootOrder: number;
};

export const prepareNICBootOrder = (vm: V1VirtualMachine): NICBootOrderPreparation => {
  const disks = getDisks(vm) ?? [];
  const anyDiskHasBootOrder = disks.some((disk) => disk.bootOrder != null);

  if (!anyDiskHasBootOrder && disks.length > 0) {
    const ifaceOrders = (getInterfaces(vm) ?? []).map((iface) => iface.bootOrder ?? 0);
    const diskStart = Math.max(0, ...ifaceOrders) + 1;
    return {
      disksWithOrder: disks.map((disk, index) => ({ ...disk, bootOrder: diskStart + index })),
      needsDiskUpdate: true,
      nicBootOrder: diskStart + disks.length,
    };
  }

  return {
    disksWithOrder: disks,
    needsDiskUpdate: false,
    nicBootOrder: getNextBootOrder(vm),
  };
};
