import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { isIPv4 } from '@kubevirt-utils/resources/vmi';

import { InterfacesData } from '../utils/types';

type UseVirtualMachinesOverviewTabInterfacesData = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
) => InterfacesData[];

const useVirtualMachinesOverviewTabInterfacesData: UseVirtualMachinesOverviewTabInterfacesData = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
) => {
  const networks = getNetworks(vm);
  const interfaces = getInterfaces(vm);
  const interfacesIPs = vmi?.status?.interfaces?.filter((iface) => !!iface.name) || [];

  const networkInterfacesData = interfaces?.map((iface) => {
    const network = networks?.find((net) => net.name === iface.name);
    const ipAddresses = interfacesIPs
      .find((iIP) => iIP.name === iface.name)
      ?.ipAddresses?.filter(isIPv4);
    return {
      iface,
      ipAddresses,
      network,
    };
  });

  return networkInterfacesData;
};

export default useVirtualMachinesOverviewTabInterfacesData;
