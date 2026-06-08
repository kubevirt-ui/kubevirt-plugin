import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import {
  formatFilterValue,
  isExcludedValue,
  stripExclusionPrefix,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { OptionsLookup } from '../../types';

export const buildOptionsLookup = (filterDefinitions: KubevirtFilter[]): OptionsLookup => {
  const lookup: OptionsLookup = new Map();
  for (const filterDef of filterDefinitions) {
    if (isEmpty(filterDef.options)) continue;
    const valueMap = new Map<string, string>();
    for (const opt of filterDef.options) {
      valueMap.set(opt.value.toLowerCase(), opt.value);
    }
    lookup.set(filterDef.id, valueMap);
  }
  return lookup;
};

export const normalizeValue = (
  rawValue: string,
  filterKey: string,
  optionsLookup: OptionsLookup,
): string => {
  const isExcluded = isExcludedValue(rawValue);
  const value = stripExclusionPrefix(rawValue);

  const valueMap = optionsLookup.get(filterKey);
  if (!valueMap) return rawValue;

  const resolved = valueMap.get(value.toLowerCase());
  if (!resolved) return rawValue;

  return formatFilterValue(resolved, isExcluded);
};
