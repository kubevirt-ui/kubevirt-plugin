import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { NumberOperator } from '@kubevirt-utils/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const EXCLUSION_PREFIX = '!';

export const KEY_ALIASES: Record<string, VirtualMachineRowFilterType> = {
  created: VirtualMachineRowFilterType.DateCreatedFrom,
  has: VirtualMachineRowFilterType.HWDevices,
  label: VirtualMachineRowFilterType.Labels,
  storage: VirtualMachineRowFilterType.StorageClass,
  vcpu: VirtualMachineRowFilterType.CPU,
};

export const SIGN_TO_OPERATOR: Record<string, NumberOperator> = {
  '!=': undefined,
  '<': NumberOperator.LessThan,
  '<=': NumberOperator.LessOrEquals,
  '=': NumberOperator.Equals,
  '>': NumberOperator.GreaterThan,
  '>=': NumberOperator.GreaterOrEquals,
};

export const NUMERIC_FILTER_KEYS = new Set<string>([
  VirtualMachineRowFilterType.CPU,
  VirtualMachineRowFilterType.Memory,
]);

export const VALID_MEMORY_UNITS = new Set<string>(Object.values(CAPACITY_UNITS));

export const VALID_FILTER_KEYS = new Set<string>([
  ...Object.values(VirtualMachineRowFilterType),
  ...Object.keys(KEY_ALIASES),
]);

export const NUMERIC_OPERATOR_REGEX = /^([a-zA-Z]+):?(>=|<=|>|<|=)(.+)$/;

export const MEMORY_VALUE_REGEX = /^(\d+(?:\.\d+)?)\s*([A-Za-z]+)$/;
