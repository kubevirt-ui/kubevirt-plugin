import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInterfacesAndNetworks } from '@kubevirt-utils/resources/vm/utils/network/utils';

import { InterfacesData } from '../utils/types';

type UseVirtualMachinesOverviewTabInterfacesData = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
) => InterfacesData[];

const useVirtualMachinesOverviewTabInterfacesData: UseVirtualMachinesOverviewTabInterfacesData = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
) => {
  const { interfaces, networks } = getInterfacesAndNetworks(vm, vmi);
  const interfacesIPs = vmi?.status?.interfaces?.filter((iface) => !!iface.name) || [];

  const networkInterfacesData = interfaces?.map((iface) => {
    const network = networks?.find((net) => net.name === iface.name);
    const nic = interfacesIPs?.find((iIP) => iIP.name === iface.name) || {};
    const ipAddresses = nic?.ipAddresses?.map((ip) => ({
      interfaceName: nic?.interfaceName,
      ip,
    }));

    return {
      iface,
      ipAddresses,
      network,
    };
  });

  return networkInterfacesData;
};

export default useVirtualMachinesOverviewTabInterfacesData;
