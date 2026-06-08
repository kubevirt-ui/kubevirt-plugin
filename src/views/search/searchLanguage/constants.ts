import { NumberOperator, numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { ALL_SEARCH_KEY_BADGES } from '@search/components/SearchDropdown/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const EXCLUSION_URL_PREFIX = '!';
export const EXCLUSION_PREFIX = '-';

export const SEARCH_KEY_TO_FILTER_TYPE = new Map<string, string>(
  ALL_SEARCH_KEY_BADGES.map(({ filterType, searchKey }) => [searchKey, filterType]),
);

export const FILTER_TYPE_TO_SEARCH_KEY = new Map<string, string>(
  ALL_SEARCH_KEY_BADGES.map(({ filterType, searchKey }) => [filterType, searchKey]),
);

export const OPERATOR_TO_SIGN: Record<string, string> = Object.fromEntries(
  Object.entries(numberOperatorInfo).map(([op, { sign }]) => [op, sign]),
);

export const SIGN_TO_OPERATOR: Record<string, NumberOperator> = {
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

export const NUMERIC_OPERATOR_REGEX = /^([a-zA-Z]+):?(>=|<=|>|<|=)(.*)$/;

export const MEMORY_VALUE_REGEX = /^(\d+(?:\.\d+)?)\s*([A-Za-z]+)$/;

export const MEMORY_UNIT_REGEX = /^(\S+)\s+(\d+(?:\.\d+)?)\s+(\w+?)$/;
export const CPU_NUMERIC_REGEX = /^(\S+)\s+(.+)$/;
