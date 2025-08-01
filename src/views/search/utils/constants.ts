import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export enum HWDeviceKind {
  GPU = 'gpu',
  HOST = 'host',
}

export enum SchedulingKind {
  AFFINITY_RULES = 'affinityRules',
  NODE_SELECTOR = 'nodeSelector',
}

export const skipRowFilterPrefix = new Set([
  VirtualMachineRowFilterType.Name,
  VirtualMachineRowFilterType.Labels,
  VirtualMachineRowFilterType.IP,
]);

export const validSearchQueryParams: string[] = Object.values(VirtualMachineRowFilterType).map(
  (type) => (skipRowFilterPrefix.has(type) ? type : `rowFilter-${type}`),
);
