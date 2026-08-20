import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type VMINetworkPresentation } from '@kubevirt-utils/resources/vmi/types';

type GetVirtualMachineInstanceNetworkTab = (
  vmi: V1VirtualMachineInstance,
) => VMINetworkPresentation[];

export const getVirtualMachineInstanceNetworkTab: GetVirtualMachineInstanceNetworkTab = (vmi) => {
  const networks = vmi?.spec?.networks;
  const interfaces = vmi?.spec?.domain?.devices?.interfaces;
  const data = interfaces?.map((iface) => {
    const network = networks?.find((net) => net?.name === iface?.name);
    return {
      iface,
      network,
    };
  });

  return data ?? [];
};

export default getVirtualMachineInstanceNetworkTab;
