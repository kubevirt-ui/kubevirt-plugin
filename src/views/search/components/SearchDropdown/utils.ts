import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import { getFilterDefinition } from '@search/searchLanguage/utils';
import { FROM_PREFIX, isFromValue, isToValue, TO_PREFIX } from '@search/utils/dateCreatedValues';
import { STATUS_VALUE_GROUPS, VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { SearchKeyBadge, ValueOption } from './types';

export const toValueOptions = (
  filterDefinitions: KubevirtFilter[],
  filterType: VirtualMachineRowFilterType,
): ValueOption[] => {
  const filterDef = getFilterDefinition(filterType, filterDefinitions);
  if (!filterDef?.options) return [];
  return filterDef.options.map(({ label, value }) => ({
    label: typeof label === 'string' ? label : value,
    value,
  }));
};

export const getFilteredOrderedOptions = (
  options: ValueOption[],
  activeSegment: string,
  selectedValues: string[],
  filterType: VirtualMachineRowFilterType,
): ValueOption[] => {
  const selectedSet = new Set(selectedValues.map((v) => v.toLowerCase()));
  const segment = activeSegment.toLowerCase();

  const filtered = options.filter(
    ({ label, value }) =>
      selectedSet.has(value.toLowerCase()) ||
      label.toLowerCase().startsWith(segment) ||
      value.toLowerCase().startsWith(segment),
  );

  if (filterType === VirtualMachineRowFilterType.Status) {
    const ordered: ValueOption[] = [];
    for (const group of STATUS_VALUE_GROUPS) {
      for (const val of group) {
        const match = filtered.find((opt) => opt.value === val);
        if (match) ordered.push(match);
      }
    }
    return ordered;
  }

  if (filterType === VirtualMachineRowFilterType.DateCreated) {
    const hasFrom = selectedValues.some((v) => isFromValue(v.toLowerCase()));
    const hasTo = selectedValues.some((v) => isToValue(v.toLowerCase()));

    if (hasFrom || hasTo) {
      const complementValue = hasFrom ? TO_PREFIX : FROM_PREFIX;
      return options.filter((opt) => opt.value === complementValue);
    }

    return filtered;
  }

  return [...filtered].sort((a, b) => universalComparator(a.label, b.label));
};

const getEffectiveFilterText = (filterText: string): string => filterText.trim().replace(/^-/, '');

export const hasActiveKeyFilter = (filterText: string): boolean =>
  getEffectiveFilterText(filterText).length > 0;

export const getFilteredKeyBadges = (
  filterText: string,
  searchKeyBadges: SearchKeyBadge[],
): SearchKeyBadge[] => {
  const effective = getEffectiveFilterText(filterText);
  if (!effective) return searchKeyBadges;
  return searchKeyBadges.filter(({ searchKey }) => searchKey.startsWith(effective.toLowerCase()));
};
