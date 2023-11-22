import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { getVMIInterfaces, getVMINetworks } from '@kubevirt-utils/resources/vmi/utils/selectors';
import { removeDuplicatesByName } from '@kubevirt-utils/utils/utils';

import { NetworkPresentation } from './constants';
import { getPrintableNetworkInterfaceType } from './selectors';

export const sortNICs = (nics: NetworkPresentation[], direction: string) =>
  nics.sort((a: NetworkPresentation, b: NetworkPresentation) => {
    const aUpdated = getPrintableNetworkInterfaceType(a.iface);
    const bUpdated = getPrintableNetworkInterfaceType(b.iface);

    if (aUpdated && bUpdated) {
      return direction === 'asc'
        ? aUpdated.localeCompare(bUpdated)
        : bUpdated.localeCompare(aUpdated);
    }
  });

export const getInterfacesAndNetworks = (vm: V1VirtualMachine, vmi: V1VirtualMachineInstance) => {
  const vmNetworks = getNetworks(vm) || [];
  const vmInterfaces = getInterfaces(vm) || [];

  const vmiInterfaces = getVMIInterfaces(vmi) || [];
  const vmiNetworks = getVMINetworks(vmi) || [];

  const networks = removeDuplicatesByName([...vmNetworks, ...vmiNetworks]);
  const interfaces = removeDuplicatesByName([...vmInterfaces, ...vmiInterfaces]);

  return {
    interfaces,
    networks,
  };
};
