import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { VMINetworkPresentation } from '@kubevirt-utils/resources/vmi/types';
import {
  getVMIInterfaces,
  getVMINetworks,
  getVMIStatusInterfaces,
} from '@kubevirt-utils/resources/vmi/utils/selectors';
import { sortByDirection, universalComparator } from '@kubevirt-utils/utils/utils';
import { SortByDirection } from '@patternfly/react-table';

import { NetworkPresentation } from './constants';
import { getPrintableNetworkInterfaceType } from './selectors';

export const sortNICs = (nics: NetworkPresentation[], direction: SortByDirection) =>
  nics.sort((a: NetworkPresentation, b: NetworkPresentation) =>
    sortByDirection(universalComparator, direction)(
      getPrintableNetworkInterfaceType(a.iface),
      getPrintableNetworkInterfaceType(b.iface),
    ),
  );

export type NicState = {
  config?: NetworkPresentation;
  runtime: VMINetworkPresentation;
};

export const getInterfacesAndNetworks = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): NicState[] => {
  const vmInterfaces = getInterfaces(vm) ?? [];
  const config: { [key: string]: NetworkPresentation } = Object.fromEntries(
    (getNetworks(vm) ?? []).map((network) => [
      network.name,
      { iface: vmInterfaces.find((iface) => iface.name === network.name), network },
    ]),
  );

  const vmiInterface = getVMIInterfaces(vmi) ?? [];
  const vmiStatus = getVMIStatusInterfaces(vmi) ?? [];
  const runtimeWithNetwork = Object.fromEntries(
    (getVMINetworks(vmi) ?? []).map((network) => [
      network.name,
      {
        iface: vmiInterface.find((iface) => iface.name === network.name),
        network,
        status: vmiStatus.find((iface) => iface.name === network.name),
      },
    ]),
  );

  const allNetworkNames = new Set([...Object.keys(config), ...Object.keys(runtimeWithNetwork)]);

  const withNetwork = Array.from(allNetworkNames).map((name) => ({
    config: config[name],
    runtime: runtimeWithNetwork[name],
  }));

  const runtimeInterfaceOnly = vmiStatus
    .filter((iface) => !allNetworkNames.has(iface.name))
    .map((status) => ({ runtime: { status } }));

  return [...withNetwork, ...runtimeInterfaceOnly];
};
