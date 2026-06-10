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

export const skipRowFilterPrefix = new Set([
  VirtualMachineRowFilterType.Name,
  VirtualMachineRowFilterType.Labels,
  VirtualMachineRowFilterType.IP,
]);

export const validSearchQueryParams: string[] = Object.values(VirtualMachineRowFilterType);

export const VM_SEARCH_INPUT_ID = 'vm-search-input';
