import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getInterfacesAndNetworks } from '@kubevirt-utils/resources/vm/utils/network/utils';

import { type InterfacesData } from './utils/types';

type GetVirtualMachinesOverviewTabInterfacesData = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
) => InterfacesData[];

const getVirtualMachinesOverviewTabInterfacesData: GetVirtualMachinesOverviewTabInterfacesData = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
) =>
  getInterfacesAndNetworks(vm, vmi).map(({ config, runtime }) => ({
    iface: config?.iface,
    ipAddresses: runtime?.status?.ipAddresses?.map((ipAddress) => ({
      interfaceName: runtime?.status?.interfaceName,
      ip: ipAddress,
    })),
    network: runtime?.network ?? config?.network,
    vm,
  }));

export default getVirtualMachinesOverviewTabInterfacesData;
