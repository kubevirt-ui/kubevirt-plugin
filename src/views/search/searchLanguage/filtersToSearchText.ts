import { type KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import {
  isExcludedValue,
  stripExclusionPrefix,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { SEARCH_KEYS } from '@search/components/SearchDropdown/constants';
import { FROM_PREFIX, TO_PREFIX } from '@search/utils/dateCreatedValues';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import {
  DATE_CREATED_FILTER_KEYS,
  FILTER_TYPE_TO_SEARCH_KEY,
  NUMERIC_FILTER_KEYS,
  OPERATOR_TO_SIGN,
} from './constants';
import { toSearchString } from './utils';

const serializeNumericValue = (filterType: string, value: string): null | string => {
  const searchKey = FILTER_TYPE_TO_SEARCH_KEY.get(filterType);
  if (!searchKey) return null;

  const parts: string[] = value.trim().split(/\s+/);
  const operatorKey: string = parts[0] ?? '';

  if (filterType === VirtualMachineRowFilterType.Memory) {
    if (parts.length !== 3) return null;
    const sign: string | undefined = OPERATOR_TO_SIGN[operatorKey];
    if (!sign) return null;
    return `${searchKey}${sign}${parts[1]}${parts[2]}`;
  }

  if (parts.length !== 2) return null;
  const sign: string | undefined = OPERATOR_TO_SIGN[operatorKey];
  if (!sign) return null;
  return `${searchKey}${sign}${parts[1]}`;
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

const serializeDateCreatedFilters = (filters: Partial<KubevirtFilterState>): null | string => {
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

const serializeOrderedFilterTokens = (
  filters: Partial<KubevirtFilterState>,
  orderedKeys: string[],
): string[] => {
  const tokens: string[] = [];
  const seen = new Set<string>();
  let dateCreatedSerialized = false;

  for (const key of orderedKeys) {
    if (seen.has(key)) continue;
    seen.add(key);

    if (DATE_CREATED_FILTER_KEYS.has(key)) {
      if (!dateCreatedSerialized) {
        const dateToken = serializeDateCreatedFilters(filters);
        if (dateToken) tokens.push(dateToken);
        dateCreatedSerialized = true;
      }
      continue;
    }

    const values = filters[key];
    if (isEmpty(values)) continue;

    tokens.push(...serializeFilterValues(key, values));
  }

  return tokens;
};

export const filtersToSearchText = (
  filters: Partial<KubevirtFilterState>,
  tokenOrder: string[],
): string => {
  const orderedKeys = [
    ...tokenOrder.filter((key) => !isEmpty(filters[key])),
    ...Object.keys(filters).filter((key) => !isEmpty(filters[key]) && !tokenOrder.includes(key)),
  ];

  return serializeOrderedFilterTokens(filters, orderedKeys).join(' ');
};
