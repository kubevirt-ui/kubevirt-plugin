import {
  V1Network,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  DEFAULT_NETWORK_INTERFACE,
  getInterfaces,
  getNetworks,
} from '@kubevirt-utils/resources/vm';
import {
  getVMIInterfaces,
  getVMINetworks,
  getVMIStatusInterfaces,
} from '@kubevirt-utils/resources/vmi/utils/selectors';
import { sortByDirection, universalComparator } from '@kubevirt-utils/utils/utils';
import { SortByDirection } from '@patternfly/react-table';

import { NetworkPresentation } from './constants';
import { getPrintableNetworkInterfaceType, isPodNetwork } from './selectors';
import { NICState } from './types';

export const sortNICs = (nics: NetworkPresentation[], direction: SortByDirection) =>
  nics.sort((a: NetworkPresentation, b: NetworkPresentation) =>
    sortByDirection(universalComparator, direction)(
      getPrintableNetworkInterfaceType(a.iface),
      getPrintableNetworkInterfaceType(b.iface),
    ),
  );

export const getInterfacesAndNetworks = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): NICState[] => {
  const vmInterfaces = getInterfaces(vm) ?? [];
  const config: { [key: string]: NetworkPresentation } = Object.fromEntries(
    (getNetworks(vm) ?? []).map((network) => [
      network.name,
      { iface: vmInterfaces.find((iface) => iface.name === network.name), network },
    ]),
  );

  const vmiInterfaces = getVMIInterfaces(vmi) ?? [];
  const vmiStatusInterfaces = getVMIStatusInterfaces(vmi) ?? [];
  const runtimeWithNetwork = Object.fromEntries(
    (getVMINetworks(vmi) ?? []).map((network) => [
      network.name,
      {
        iface: vmiInterfaces.find((iface) => iface.name === network.name),
        network,
        status: vmiStatusInterfaces.find((iface) => iface.name === network.name),
      },
    ]),
  );

  const allNetworkNames = new Set([...Object.keys(config), ...Object.keys(runtimeWithNetwork)]);

  const withNetwork = Array.from(allNetworkNames).map((name) => ({
    config: config[name],
    runtime: runtimeWithNetwork[name],
  }));

  const runtimeInterfacesOnly = vmiStatusInterfaces
    .filter((iface) => !allNetworkNames.has(iface.name))
    .map((status) => ({ runtime: { status } }));

  return [...withNetwork, ...runtimeInterfacesOnly];
};

export const removePodNetworkFromVM = (vm: V1VirtualMachine): void => {
  vm.spec.template.spec.domain.devices.interfaces = getInterfaces(vm)?.filter(
    (iface) => iface.name !== DEFAULT_NETWORK_INTERFACE.name,
  );
  vm.spec.template.spec.networks = getNetworks(vm)?.filter((network) => !isPodNetwork(network));
  vm.spec.template.spec.domain.devices.autoattachPodInterface = false;
};

export const networksHavePodNetwork = (networks: V1Network[]): boolean =>
  networks?.some(isPodNetwork);
