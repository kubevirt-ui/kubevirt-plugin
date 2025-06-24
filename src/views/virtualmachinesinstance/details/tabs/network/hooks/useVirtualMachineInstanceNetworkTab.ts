import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VMINetworkPresentation } from '@kubevirt-utils/resources/vmi/types';

type UseVirtualMachineInstanceNetworkTab = (
  vmi: V1VirtualMachineInstance,
) => [VMINetworkPresentation[]];

export const useVirtualMachineInstanceNetworkTab: UseVirtualMachineInstanceNetworkTab = (vmi) => {
  const networks = vmi?.spec?.networks;
  const interfaces = vmi?.spec?.domain?.devices?.interfaces;
  const data = interfaces?.map((iface) => {
    const network = networks?.find((net) => net?.name === iface?.name);
    return {
      iface,
      network,
    };
  });

  return [data || []];
};

export default useVirtualMachineInstanceNetworkTab;
