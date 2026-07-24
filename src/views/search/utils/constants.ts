import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export enum HWDeviceKind {
  GPU = 'gpu',
  HOST = 'host',
}

export enum SchedulingKind {
  AFFINITY_RULES = 'affinityRules',
  NODE_SELECTOR = 'nodeSelector',
}

export enum GuestAgentStatus {
  NOT_REPORTING = 'notReporting',
  REPORTING = 'reporting',
}

export const singleStringFields = new Set([
  VirtualMachineRowFilterType.DateCreatedFrom,
  VirtualMachineRowFilterType.DateCreatedTo,
  VirtualMachineRowFilterType.Description,
  VirtualMachineRowFilterType.IP,
  VirtualMachineRowFilterType.Name,
]);

export const arrayFields = new Set([
  VirtualMachineRowFilterType.Architecture,
  VirtualMachineRowFilterType.Cluster,
  VirtualMachineRowFilterType.Labels,
  VirtualMachineRowFilterType.NAD,
  VirtualMachineRowFilterType.Node,
  VirtualMachineRowFilterType.OS,
  VirtualMachineRowFilterType.Project,
  VirtualMachineRowFilterType.Status,
  VirtualMachineRowFilterType.StorageClass,
]);

export const skipRowFilterPrefix = new Set([
  VirtualMachineRowFilterType.Name,
  VirtualMachineRowFilterType.Labels,
  VirtualMachineRowFilterType.IP,
]);

export const validSearchQueryParams: string[] = Object.values(VirtualMachineRowFilterType);

export const VM_SEARCH_INPUT_ID = 'vm-search-input';
