import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { formatFilterValue } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import {
  MEMORY_VALUE_REGEX,
  NUMERIC_FILTER_KEYS,
  SIGN_TO_OPERATOR,
  VALID_MEMORY_UNITS,
} from './constants';
import { SearchToken } from './types';

export const tokenToFilterState = (token: SearchToken): null | Partial<KubevirtFilterState> => {
  if (isEmpty(token.values) || token.values.every((v) => !v)) return null;

  const { exclude, key, operator, values } = token;

  if (!key) {
    return { [VirtualMachineRowFilterType.Name]: [values[0]] };
  }

  if (NUMERIC_FILTER_KEYS.has(key) && operator) {
    const numericValue = formatNumericValue(key, operator, values[0]);
    if (!numericValue) return null;

    const finalValue = formatFilterValue(numericValue, exclude);
    return { [key]: [finalValue] };
  }

  const finalValues = values.map((v) => formatFilterValue(v, exclude));
  return { [key]: finalValues };
};

const formatNumericValue = (key: string, operatorSign: string, rawValue: string): null | string => {
  const operatorEnum = SIGN_TO_OPERATOR[operatorSign];
  if (!operatorEnum) return null;

  if (key === VirtualMachineRowFilterType.Memory) {
    const match = rawValue.match(MEMORY_VALUE_REGEX);
    if (!match) return null;

    const [, numStr, unit] = match;
    const normalizedUnit = normalizeMemoryUnit(unit);
    if (!normalizedUnit) return null;

    return `${operatorEnum} ${numStr} ${normalizedUnit}s`;
  }

  const num = Number(rawValue);
  if (isNaN(num)) return null;

  return `${operatorEnum} ${rawValue}`;
};

const normalizeMemoryUnit = (unit: string): null | string => {
  const lower = unit.toLowerCase();
  for (const validUnit of VALID_MEMORY_UNITS) {
    if (validUnit.toLowerCase() === lower) return validUnit;
  }
  return null;
};
