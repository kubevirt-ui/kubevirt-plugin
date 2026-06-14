import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import {
  formatFilterValue,
  isExcludedValue,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/utils';

import { OptionsLookup } from '../../types';

export const buildOptionsLookup = (filterDefinitions: KubevirtFilter[]): OptionsLookup => {
  const lookup: OptionsLookup = new Map();
  for (const filterDef of filterDefinitions) {
    if (!filterDef.options?.length) continue;
    const valueMap = new Map<string, string>();
    for (const opt of filterDef.options) {
      valueMap.set(String(opt.value).toLowerCase(), String(opt.value));
    }
    lookup.set(filterDef.id, valueMap);
  }
  return lookup;
};

export const normalizeValue = (
  value: string,
  filterKey: string,
  optionsLookup: OptionsLookup,
): string => {
  const isExcluded = isExcludedValue(value);
  const rawValue = isExcluded ? value.slice(1) : value;

  const valueMap = optionsLookup.get(filterKey);
  if (!valueMap) return value;

  const resolved = valueMap.get(rawValue.toLowerCase());
  if (!resolved) return value;

  return formatFilterValue(resolved, isExcluded);
};
