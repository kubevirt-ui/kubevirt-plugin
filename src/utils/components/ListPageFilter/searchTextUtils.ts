import { type TFunction } from 'i18next';

import { numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { type RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { STATIC_SEARCH_FILTERS, STATIC_SEARCH_FILTERS_PLACEHOLDERS } from './constants';
import { type useSearchFiltersParameters } from './hooks/useSearchFiltersParameters';

export const getInitialSearchText = (
  searchText: ReturnType<typeof useSearchFiltersParameters>,
  searchFilterType: string,
): string =>
  searchFilterType !== STATIC_SEARCH_FILTERS.labels ? searchText[searchFilterType] : '';

type PlaceholderKey = keyof typeof STATIC_SEARCH_FILTERS_PLACEHOLDERS;

export const getSearchTextPlaceholder = (
  t: TFunction,
  searchType: string,
  selectedSearchFilter: RowFilter,
  nameFilterPlaceholder: string,
): string => {
  if (searchType === STATIC_SEARCH_FILTERS.name)
    return nameFilterPlaceholder
      ? t(nameFilterPlaceholder)
      : t(STATIC_SEARCH_FILTERS_PLACEHOLDERS.name);

  const isValidPlaceholderKey = (key: string): key is PlaceholderKey =>
    key in STATIC_SEARCH_FILTERS_PLACEHOLDERS;

  return isValidPlaceholderKey(searchType)
    ? t(STATIC_SEARCH_FILTERS_PLACEHOLDERS[searchType])
    : t('Search by {{filterName}}...', {
        filterName: selectedSearchFilter?.filterGroupName,
      });
};

export const getFilterLabels = (
  query?: null | string,
  filterType?: VirtualMachineRowFilterType,
): string[] => {
  if (!query) {
    return [];
  }

  if (
    filterType === VirtualMachineRowFilterType.CPU ||
    filterType === VirtualMachineRowFilterType.Memory
  ) {
    const [operator, number, unit] = query.split(' ');

    const unitSuffix = unit ? ` ${unit}` : '';
    return [`${numberOperatorInfo[operator].sign} ${number}${unitSuffix}`];
  }

  return query.split(',');
};
