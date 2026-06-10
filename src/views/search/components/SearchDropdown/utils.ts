import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { universalComparator } from '@kubevirt-utils/utils/utils';

import { GROUPED_FILTER_KEYS, STATUS_VALUE_GROUPS } from './constants/statusGroups';
import { SEARCH_KEY_BADGES } from './constants';
import { SearchKeyBadge, ValueOption } from './types';

export const toValueOptions = (
  filterDefinitions: KubevirtFilter[],
  filterType: string,
): ValueOption[] => {
  const filterDef = filterDefinitions.find((d) => d.id === filterType);
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
  filterType: string,
): ValueOption[] => {
  const selectedSet = new Set(selectedValues.map((v) => v.toLowerCase()));
  const segment = activeSegment.toLowerCase();

  const filtered = options.filter(
    ({ label, value }) =>
      selectedSet.has(value.toLowerCase()) ||
      label.toLowerCase().startsWith(segment) ||
      value.toLowerCase().startsWith(segment),
  );

  if (GROUPED_FILTER_KEYS.has(filterType)) {
    const ordered: ValueOption[] = [];
    for (const group of STATUS_VALUE_GROUPS) {
      for (const val of group) {
        const match = filtered.find((opt) => opt.value === val);
        if (match) ordered.push(match);
      }
    }
    return ordered;
  }

  return [...filtered].sort((a, b) => universalComparator(a.label, b.label));
};

const getEffectiveFilterText = (filterText?: string): string =>
  (filterText ?? '').trim().replace(/^-/, '');

export const hasActiveKeyFilter = (filterText?: string): boolean =>
  getEffectiveFilterText(filterText).length > 0;

export const getFilteredKeyBadges = (filterText?: string): SearchKeyBadge[] => {
  const effective = getEffectiveFilterText(filterText);
  if (!effective) return SEARCH_KEY_BADGES;
  return SEARCH_KEY_BADGES.filter((badge) => badge.searchKey.startsWith(effective.toLowerCase()));
};
