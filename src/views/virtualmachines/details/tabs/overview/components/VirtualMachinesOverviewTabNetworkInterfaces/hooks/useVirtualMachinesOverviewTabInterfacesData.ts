import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { InterfacesData } from '../utils/types';

type UseVirtualMachinesOverviewTabInterfacesData = (
  vm: V1VirtualMachine,
) => [InterfacesData[], boolean, any];

const useVirtualMachinesOverviewTabInterfacesData: UseVirtualMachinesOverviewTabInterfacesData = (
  vm: V1VirtualMachine,
) => {
  const [vmi, loaded, loadError] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
  });
  const networks = getNetworks(vm);
  const interfaces = getInterfaces(vm);
  const interfacesIPs = vmi?.status?.interfaces?.filter((iface) => !!iface.name) || [];

  const networkInterfacesData = interfaces?.map((iface) => {
    const network = networks?.find((net) => net.name === iface.name);
    const ipAddresses = interfacesIPs.find((iIP) => iIP.name === iface.name)?.ipAddresses;
    return {
      iface,
      network,
      ipAddresses,
    };
  });

  return [networkInterfacesData, loaded, loadError];
};

export default useVirtualMachinesOverviewTabInterfacesData;
