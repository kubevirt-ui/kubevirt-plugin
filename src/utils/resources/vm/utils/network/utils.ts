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
import {
  removeDuplicatesByName,
  sortByDirection,
  universalComparator,
} from '@kubevirt-utils/utils/utils';
import { SortByDirection } from '@patternfly/react-table';
import { isRunning } from '@virtualmachines/utils';

import { NetworkPresentation } from './constants';
import { getPrintableNetworkInterfaceType } from './selectors';

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
export const getInterfacesAndNetworks = (vm: V1VirtualMachine, vmi: V1VirtualMachineInstance) => {
  const vmNetworks = getNetworks(vm) || [];
  const vmInterfaces = getInterfaces(vm) || [];

  const vmiInterfaces = (isRunning(vm) ? getVMIStatusInterfaces(vmi) : getVMIInterfaces(vmi)) || [];
  const vmiNetworks = getVMINetworks(vmi) || [];

  const networks = removeDuplicatesByName([...vmNetworks, ...vmiNetworks]);
  const interfaces = removeDuplicatesByName([...vmInterfaces, ...vmiInterfaces]).filter(
    (iface) => !isLoopbackOrPseudoInterface(iface),
  );

  return {
    interfaces,
    networks,
  };
};
