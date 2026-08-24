import { NumberOperator, numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { SEARCH_KEY_BADGES } from '@search/components/SearchDropdown/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const EXCLUSION_URL_PREFIX = '!';
export const EXCLUSION_PREFIX = '-';

export const SEARCH_KEY_TO_FILTER_TYPE = new Map<string, string>(
  SEARCH_KEY_BADGES.map(({ filterType, searchKey }) => [searchKey, filterType]),
);

export const FILTER_TYPE_TO_SEARCH_KEY = new Map<string, string>(
  SEARCH_KEY_BADGES.map(({ filterType, searchKey }) => [filterType, searchKey]),
);

export const OPERATOR_TO_SIGN: Record<string, string> = Object.fromEntries(
  Object.entries(numberOperatorInfo).map(([key, { sign }]) => [key, sign]),
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

export const DATE_CREATED_FILTER_KEYS = new Set<string>([
  VirtualMachineRowFilterType.DateCreated,
  VirtualMachineRowFilterType.DateCreatedFrom,
  VirtualMachineRowFilterType.DateCreatedTo,
]);

export const NUMERIC_OPERATOR_REGEX = /^([a-zA-Z]+):?(>=|<=|>|<|=)(.*)$/;

export const MEMORY_VALUE_REGEX = /^(\d+(?:\.\d+)?)\s*([A-Za-z]+)$/;

export const parseMemoryUnit = (input: string): [string, string, string] | null => {
  const parts = input.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const [key, numStr, unit] = parts;
  if (!/^\d+(?:\.\d+)?$/.test(numStr)) return null;
  if (!/^[A-Za-z]+$/.test(unit)) return null;
  return [key, numStr, unit];
};

export const parseCpuNumeric = (input: string): [string, string] | null => {
  const trimmed = input.trim();
  const idx = trimmed.search(/\s/);
  if (idx < 1) return null;
  const key = trimmed.slice(0, idx);
  const rest = trimmed.slice(idx).trim();
  if (!rest) return null;
  return [key, rest];
};
