import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceNetworkInterface,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import {
  getVMIInterfaces,
  getVMINetworks,
  getVMIStatusInterfaces,
} from '@kubevirt-utils/resources/vmi/utils/selectors';
import { sortByDirection, universalComparator } from '@kubevirt-utils/utils/utils';
import { SortByDirection } from '@patternfly/react-table';

import { NetworkPresentation } from './constants';
import { getPrintableNetworkInterfaceType } from './selectors';
import { NICState } from './types';

export const sortNICs = (nics: NetworkPresentation[], direction: SortByDirection) =>
  nics.sort((a: NetworkPresentation, b: NetworkPresentation) =>
    sortByDirection(universalComparator, direction)(
      getPrintableNetworkInterfaceType(a.iface),
      getPrintableNetworkInterfaceType(b.iface),
    ),
  );

const isLoopbackOrPseudoInterface = (status: V1VirtualMachineInstanceNetworkInterface): boolean => {
  const { ipAddress = '', ipAddresses = [], name = '' } = status ?? {};

  const isLoopbackName = name.toLowerCase().includes('loopback');
  const isLoopbackIP = ipAddress === '127.0.0.1' || ipAddresses.includes('::1');

  return isLoopbackName || isLoopbackIP;
};
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
    .filter((iface) => iface.name && !allNetworkNames.has(iface.name))
    .filter((iface) => !isLoopbackOrPseudoInterface(iface))
    .map((status) => ({ runtime: { status } }));

  return [...withNetwork, ...runtimeInterfacesOnly];
};
