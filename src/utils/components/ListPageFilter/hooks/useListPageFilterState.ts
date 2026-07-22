import { useMemo } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  type K8sResourceCommon,
  type OnFilterChange,
  type RowFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { type SelectProps } from '@patternfly/react-core';

import { type ApplyTextFilters, type TextFiltersType } from '../types';
import { type Filter, type FilterKeys, generateRowFilters, getFiltersData } from '../utils';

import useListPageFiltersMethods from './useListPageFiltersMethods';
import { useRowFiltersParameters } from './useRowFiltersParameters';
import { useSearchFiltersParameters } from './useSearchFiltersParameters';
import useTextFilterState from './useTextFilterState';

type UseListPageFilterStateArgs = {
  data?: K8sResourceCommon[];
  hideLabelFilter?: boolean;
  hideNameLabelFilters?: boolean;
  onFilterChange?: OnFilterChange;
  rowFilters?: RowFilter[];
  searchFilters?: RowFilter[];
};

type UseListPageFilterStateResult = {
  applyTextFilters: ApplyTextFilters;
  applyTextFiltersWithDebounce: ApplyTextFilters;
  clearAll: () => void;
  filters: Filter;
  filtersNameMap: FilterKeys;
  generatedRowFilters: ReturnType<typeof generateRowFilters>;
  onSelect: SelectProps['onSelect'];
  searchInputText: string;
  searchType: string;
  selectedRowFilters: string[];
  setSearchInputText: (text: string) => void;
  textFilters: TextFiltersType;
  textFilterSelectOptionNames: Record<string, string>;
  toolbarFilters: RowFilter[] | undefined;
  updateRowFilterSelected: (id: string[]) => void;
};

const useListPageFilterState = ({
  data,
  hideLabelFilter,
  hideNameLabelFilters,
  onFilterChange,
  rowFilters,
  searchFilters = [],
}: UseListPageFilterStateArgs): UseListPageFilterStateResult => {
  const { t } = useKubevirtTranslation();

  const toolbarFilters = rowFilters?.filter((filter) => 'items' in filter);
  const generatedRowFilters = useDeepCompareMemoize(generateRowFilters(toolbarFilters ?? [], data));
  const [filters, filtersNameMap, filterKeys] = useMemo<[Filter, FilterKeys, FilterKeys, string[]]>(
    () => getFiltersData(generatedRowFilters),
    [generatedRowFilters],
  );

  const [selectedRowFilters, onRowFilterSearchParamChange] = useRowFiltersParameters({
    filterKeys,
    filters,
  });

  const textFilters = useSearchFiltersParameters(searchFilters);

  const textFilterSelectOptionNames: Record<string, string> = {
    ...searchFilters.reduce(
      (acc, filter) => ({
        ...acc,
        [filter.type]: filter.filterGroupName,
      }),
      {},
    ),
    ...(!hideLabelFilter && !hideNameLabelFilters ? { labels: t('Label') } : {}),
    ...(!hideNameLabelFilters ? { name: t('Name') } : {}),
  };

  const { onSelect, searchInputText, searchType, setSearchInputText } = useTextFilterState({
    searchFilters,
    textFilters,
    textFilterSelectOptionNames,
  });

  const applyFilters: OnFilterChange = (type, input) => onFilterChange?.(type, input);

  const { applyTextFilters, applyTextFiltersWithDebounce, clearAll, updateRowFilterSelected } =
    useListPageFiltersMethods({
      applyFilters,
      generatedRowFilters,
      onRowFilterSearchParamChange,
      searchFilters,
      selectedRowFilters,
      setSearchInputText,
    });

  return {
    applyTextFilters,
    applyTextFiltersWithDebounce,
    clearAll,
    filters,
    filtersNameMap,
    generatedRowFilters,
    onSelect,
    searchInputText,
    searchType,
    selectedRowFilters,
    setSearchInputText,
    textFilters,
    textFilterSelectOptionNames,
    toolbarFilters,
    updateRowFilterSelected,
  };
};

export default useListPageFilterState;
