import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const FILTERS_SHOWN_VM_LIST = [
  VirtualMachineRowFilterType.Namespace,
  VirtualMachineRowFilterType.Status,
  VirtualMachineRowFilterType.OS,
];

export const ACM_FILTERS_SHOWN_VM_LIST = [
  ...FILTERS_SHOWN_VM_LIST,
  VirtualMachineRowFilterType.Cluster,
];
