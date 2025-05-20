import React, {
  FC,
  MutableRefObject,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ColumnLayout,
  K8sResourceCommon,
  OnFilterChange,
  RowFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Toolbar, ToolbarContent, ToolbarToggleGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { ListManagementGroupSize } from '@virtualmachines/list/listManagementGroupSize';

import ColumnManagement from '../ColumnManagementModal/ColumnManagement';

import AdvancedFiltersToolbarItem from './components/AdvancedFiltersToolbarItem';
import RowFilters from './components/RowFilters';
import TextFiltersToolbarItem from './components/TextFiltersToolbarItem';
import useListPageFiltersMethods from './hooks/useListPageFiltersMethods';
import { useRowFiltersParameters } from './hooks/useRowFiltersParameters';
import { useSearchFiltersParameters } from './hooks/useSearchFiltersParameters';
import useTextFilterState from './hooks/useTextFilterState';
import { ResetTextSearch } from './types';
import { Filter, FilterKeys, generateRowFilters, getFiltersData } from './utils';

type ListPageFilterProps = {
  advancedFilters?: RowFilter[];
  className?: string;
  columnLayout?: ColumnLayout;
  data?: K8sResourceCommon[];
  hideColumnManagement?: boolean;
  hideLabelFilter?: boolean;
  hideNameLabelFilters?: boolean;
  listManagementGroupSize?: ListManagementGroupSize;
  loaded?: boolean;
  nameFilterPlaceholder?: string;
  onFilterChange?: OnFilterChange;
  projectFilter?: RowFilter;
  refProp?: MutableRefObject<{ resetTextSearch: ResetTextSearch }>;
  rowFilters?: RowFilter[];
  searchFilters?: RowFilter[];
};

const ListPageFilter: FC<ListPageFilterProps> = ({
  advancedFilters = [],
  className,
  columnLayout,
  data,
  hideColumnManagement,
  hideLabelFilter,
  hideNameLabelFilters,
  listManagementGroupSize,
  loaded,
  nameFilterPlaceholder,
  onFilterChange,
  projectFilter,
  refProp,
  rowFilters,
  searchFilters = [],
}) => {
  const { t } = useKubevirtTranslation();

  const [toolbarIsExpanded, setToolbarIsExpanded] = useState(false);

  useEffect(() => {
    if (listManagementGroupSize !== ListManagementGroupSize.sm) {
      setToolbarIsExpanded(false);
    }
  }, [listManagementGroupSize]);

  const toolbarFilters = rowFilters?.filter((filter) => 'items' in filter);

  // Generate rowFilter items and counts. Memoize to minimize re-renders.
  const generatedRowFilters = useDeepCompareMemoize(generateRowFilters(toolbarFilters ?? [], data));

  // Reduce generatedRowFilters once and memoize
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

  const { onSelect, resetTextSearch, searchInputText, searchType, setSearchInputText } =
    useTextFilterState({ searchFilters, textFilters, textFilterSelectOptionNames });

  useImperativeHandle(
    refProp,
    () => ({
      resetTextSearch,
    }),
    [resetTextSearch],
  );

  const applyFilters: OnFilterChange = (type, input) => onFilterChange?.(type, input);

  const { applyTextFilters, applyTextFiltersWithDebounce, clearAll, updateRowFilterSelected } =
    useListPageFiltersMethods({
      applyFilters,
      generatedRowFilters,
      onRowFilterSearchParamChange,
      searchFilters: [...searchFilters, ...advancedFilters, projectFilter],
      selectedRowFilters,
      setSearchInputText,
    });

  if (!loaded) return null;

  return (
    <Toolbar
      toggleIsExpanded={() => {
        setToolbarIsExpanded(!toolbarIsExpanded);
      }}
      className={className}
      clearAllFilters={clearAll}
      clearFiltersButtonText={t('Clear all filters')}
      data-test="filter-toolbar"
      id="filter-toolbar"
      isExpanded={toolbarIsExpanded}
    >
      <ToolbarContent>
        <ToolbarToggleGroup breakpoint="md" toggleIcon={<FilterIcon />}>
          <RowFilters
            filters={filters}
            filtersNameMap={filtersNameMap}
            generatedRowFilters={generatedRowFilters}
            listManagementGroupSize={listManagementGroupSize}
            rowFilters={toolbarFilters}
            selectedRowFilters={selectedRowFilters}
            updateRowFilterSelected={updateRowFilterSelected}
          />
          <AdvancedFiltersToolbarItem
            advancedFilters={advancedFilters}
            applyTextFilters={applyTextFilters}
            showProjectFilter={!!projectFilter}
          />
          <TextFiltersToolbarItem
            applyTextFilters={applyTextFilters}
            applyTextFiltersWithDebounce={applyTextFiltersWithDebounce}
            data={data}
            nameFilterPlaceholder={nameFilterPlaceholder}
            onSelect={onSelect}
            searchFilters={searchFilters}
            searchInputText={searchInputText}
            searchType={searchType}
            selectOptionNames={textFilterSelectOptionNames}
            setSearchInputText={setSearchInputText}
            textFilters={textFilters}
          />
        </ToolbarToggleGroup>
        <ColumnManagement columnLayout={columnLayout} hideColumnManagement={hideColumnManagement} />
      </ToolbarContent>
    </Toolbar>
  );
};

export default ListPageFilter;
