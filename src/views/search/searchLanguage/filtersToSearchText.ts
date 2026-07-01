import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import {
  isExcludedValue,
  stripExclusionPrefix,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FROM_PREFIX, TO_PREFIX } from '@search/utils/dateCreatedValues';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { SEARCH_KEYS } from '@search/components/SearchDropdown/constants';
import {
  CPU_NUMERIC_REGEX,
  DATE_CREATED_FILTER_KEYS,
  FILTER_TYPE_TO_SEARCH_KEY,
  MEMORY_UNIT_REGEX,
  NUMERIC_FILTER_KEYS,
  OPERATOR_TO_SIGN,
} from './constants';
import { toSearchString } from './utils';

const serializeNumericValue = (filterType: string, value: string): null | string => {
  const searchKey = FILTER_TYPE_TO_SEARCH_KEY.get(filterType);
  if (!searchKey) return null;

  if (filterType === VirtualMachineRowFilterType.Memory) {
    const match = value.match(MEMORY_UNIT_REGEX);
    if (!match) return null;
    const [, operatorEnum, num, unit] = match;
    const sign = OPERATOR_TO_SIGN[operatorEnum];
    if (!sign) return null;
    return `${searchKey}${sign}${num}${unit}`;
  }

  const match = value.match(CPU_NUMERIC_REGEX);
  if (!match) return null;
  const [, operatorEnum, num] = match;
  const sign = OPERATOR_TO_SIGN[operatorEnum];
  if (!sign) return null;
  return `${searchKey}${sign}${num}`;
};

const serializeFilterValues = (filterType: string, values: string[]): string[] => {
  const searchKey = FILTER_TYPE_TO_SEARCH_KEY.get(filterType);
  if (!searchKey) return [];

  const isNumeric = NUMERIC_FILTER_KEYS.has(filterType);

  const tokens: string[] = [];
  const included: string[] = [];
  const excluded: string[] = [];

  const deduplicatedValues = new Set(values);

  for (const val of deduplicatedValues) {
    const isExcluded = isExcludedValue(val);
    const cleanVal = stripExclusionPrefix(val);

    if (isNumeric) {
      const serialized = serializeNumericValue(filterType, cleanVal);
      if (!serialized) continue;
      tokens.push(toSearchString(serialized, isExcluded));
      continue;
    }

    (isExcluded ? excluded : included).push(cleanVal);
  }

  if (!isEmpty(included)) {
    tokens.push(`${searchKey}:${included.join(',')}`);
  }

  if (!isEmpty(excluded)) {
    tokens.push(toSearchString(`${searchKey}:${excluded.join(',')}`, true));
  }

  return tokens;
};

const serializeDateCreatedFilters = (filters: Partial<KubevirtFilterState>): string | null => {
  const dateCreated = filters[VirtualMachineRowFilterType.DateCreated]?.[0];
  const dateFrom = filters[VirtualMachineRowFilterType.DateCreatedFrom]?.[0];
  const dateTo = filters[VirtualMachineRowFilterType.DateCreatedTo]?.[0];

  if (dateCreated) return `${SEARCH_KEYS.DATE_CREATED}:${dateCreated}`;

  const parts: string[] = [];
  if (dateFrom) parts.push(`${FROM_PREFIX}${dateFrom}`);
  if (dateTo) parts.push(`${TO_PREFIX}${dateTo}`);

  if (isEmpty(parts)) return null;
  return `${SEARCH_KEYS.DATE_CREATED}:${parts.join(',')}`;
};

export const filtersToSearchText = (
  filters: Partial<KubevirtFilterState>,
  tokenOrder: string[],
): string => {
  const orderedKeys = [
    ...tokenOrder.filter((key) => !isEmpty(filters[key])),
    ...Object.keys(filters).filter((key) => !isEmpty(filters[key]) && !tokenOrder.includes(key)),
  ];

  const seen = new Set<string>();
  const tokens: string[] = [];
  let dateCreatedSerialized = false;

  for (const key of orderedKeys) {
    if (seen.has(key)) continue;
    seen.add(key);

    const values = filters[key];
    if (isEmpty(values)) continue;

    if (DATE_CREATED_FILTER_KEYS.has(key)) {
      if (!dateCreatedSerialized) {
        const dateToken = serializeDateCreatedFilters(filters);
        if (dateToken) tokens.push(dateToken);
        dateCreatedSerialized = true;
      }
      continue;
    }

    tokens.push(...serializeFilterValues(key, values));
  }

  return tokens.join(' ');
};
