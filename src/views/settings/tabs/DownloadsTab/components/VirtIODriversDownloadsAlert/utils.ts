import { getVMListURL } from '@multicluster/urls';
import { VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS } from '@virtualmachines/navigator/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const buildOutdatedVirtioDriversPath = (cluster?: string): string => {
  const params = new URLSearchParams();
  params.set(VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS);
  params.set(VirtualMachineRowFilterType.OutdatedVirtioDrivers, 'true');

  const basePath = getVMListURL(cluster);
  return `${basePath}?${params.toString()}`;
};
