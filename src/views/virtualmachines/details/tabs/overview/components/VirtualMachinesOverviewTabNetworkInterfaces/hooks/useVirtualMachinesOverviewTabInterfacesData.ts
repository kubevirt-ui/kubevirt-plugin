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
) =>
  getInterfacesAndNetworks(vm, vmi).map(({ config, runtime }) => ({
    iface: config?.iface,
    ipAddresses: runtime?.status?.ipAddresses?.map((ip) => ({
      interfaceName: runtime?.status?.interfaceName,
      ip,
    })),
    network: runtime?.network ?? config?.network,
    vm,
  }));

export default useVirtualMachinesOverviewTabInterfacesData;
