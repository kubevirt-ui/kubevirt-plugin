import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import {
  KubevirtFilter,
  KubevirtFilterState,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { formatFilterValue } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { createCPUQueryValue, createMemoryQueryValue } from '@search/utils/query';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { buildOptionsLookup, normalizeValue } from './hooks/useOnCommitText/utils';
import { MEMORY_VALUE_REGEX, NUMERIC_FILTER_KEYS, SIGN_TO_OPERATOR } from './constants';
import { parseSearchToken } from './parser';
import { InvalidKeyError, InvalidValueError, OptionsLookup, ValidationResult } from './types';
import { getSanitizedInput } from './utils';

const validateTokenValues = (
  rawValues: string[],
  filterType: string,
  optionsLookup: OptionsLookup,
): { invalidValues: string[]; validValues: string[] } => {
  const optionMap = optionsLookup.get(filterType);
  if (!optionMap) return { invalidValues: [], validValues: rawValues };

  const validValues: string[] = [];
  const invalidValues: string[] = [];

  for (const val of rawValues) {
    if (optionMap.has(val.toLowerCase())) {
      validValues.push(val);
    } else {
      invalidValues.push(val);
    }
  }

  return { invalidValues, validValues };
};

const normalizeMemoryUnit = (unit: string): CAPACITY_UNITS | undefined => {
  const lower = unit.toLowerCase();
  return Object.values(CAPACITY_UNITS).find((u) => u.toLowerCase() === lower);
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

    return createMemoryQueryValue(operatorEnum, Number(numStr), normalizedUnit);
  }

  const num = Number(rawValue);
  if (isNaN(num)) return null;

  return createCPUQueryValue(operatorEnum, num);
};

export const validateAndBuildFilterState = (
  text: string,
  filterDefinitions: KubevirtFilter[],
): ValidationResult => {
  const rawTokens = text.trim().split(/\s+/).filter(Boolean);
  const optionsLookup = buildOptionsLookup(filterDefinitions);

  const filterState: Partial<KubevirtFilterState> = {};
  const invalidKeyErrors: InvalidKeyError[] = [];
  const invalidValueErrors: InvalidValueError[] = [];
  const tokenOrder: string[] = [];

  for (const rawToken of rawTokens) {
    const token = parseSearchToken(rawToken);
    const { exclude, filterType, operator, searchKey, values } = token;

    if (!filterType) {
      const sanitized = getSanitizedInput(rawToken.trim());
      const colonIdx = sanitized.indexOf(':');
      if (colonIdx > 0) {
        const rawKey = sanitized.slice(0, colonIdx);
        invalidKeyErrors.push({ key: rawKey, raw: rawToken });
        continue;
      }

      const finalValue = formatFilterValue(values[0], exclude);
      filterState[VirtualMachineRowFilterType.Name] = [finalValue];
      if (!tokenOrder.includes(VirtualMachineRowFilterType.Name)) {
        tokenOrder.push(VirtualMachineRowFilterType.Name);
      }
      continue;
    }

    if (NUMERIC_FILTER_KEYS.has(filterType)) {
      if (!operator || isEmpty(values)) continue;

      const numericValue = formatNumericValue(filterType, operator, values[0]);
      if (!numericValue) {
        invalidValueErrors.push({
          filterType,
          invalidValues: [values[0]],
          searchKey,
          validValues: [],
        });
        continue;
      }

      const finalValue = formatFilterValue(numericValue, exclude);
      filterState[filterType] = [finalValue];
      if (!tokenOrder.includes(filterType)) tokenOrder.push(filterType);
      continue;
    }

    const { invalidValues, validValues } = validateTokenValues(values, filterType, optionsLookup);

    if (!isEmpty(invalidValues)) {
      invalidValueErrors.push({
        filterType,
        invalidValues,
        searchKey,
        validValues,
      });
    }

    if (!isEmpty(validValues)) {
      const finalValues = validValues.map((v) =>
        formatFilterValue(normalizeValue(v, filterType, optionsLookup), exclude),
      );

      const existing = filterState[filterType] ?? [];
      filterState[filterType] = [...new Set([...existing, ...finalValues])];

      if (!tokenOrder.includes(filterType)) tokenOrder.push(filterType);
    }
  }

  return { filterState, invalidKeyErrors, invalidValueErrors, tokenOrder };
};
