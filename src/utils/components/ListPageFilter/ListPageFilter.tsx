import React, { ReactNode, useMemo, useState } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ColumnLayout,
  K8sResourceCommon,
  OnFilterChange,
  RowFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Toolbar, ToolbarContent, ToolbarItem, ToolbarToggleGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import CheckboxSelectFilter from './components/CheckboxSelectFilter';
import ListPageFilterToolbarActions from './components/ListPageFilterToolbarActions';
import RowFilters from './components/RowFilters';
import TextFiltersToolbarItem from './components/TextFiltersToolbarItem';
import useListPageFiltersMethods from './hooks/useListPageFiltersMethods';
import { useRowFiltersParameters } from './hooks/useRowFiltersParameters';
import { useSearchFiltersParameters } from './hooks/useSearchFiltersParameters';
import useTextFilterState from './hooks/useTextFilterState';
import { Filter, FilterKeys, generateRowFilters, getFiltersData } from './utils';

type ListPageFilterProps = {
  className?: string;
  columnLayout?: ColumnLayout;
  customRowFiltersMenu?: ReactNode;
  data?: K8sResourceCommon[];
  filtersWithSelect?: RowFilter[];
  hideColumnManagement?: boolean;
  hideLabelFilter?: boolean;
  hideNameLabelFilters?: boolean;
  loaded?: boolean;
  nameFilterPlaceholder?: string;
  onFilterChange?: OnFilterChange;
  rowFilters?: RowFilter[];
  searchFilters?: RowFilter[];
  /** Rendered in the toolbar row before column management */
  toolbarEndContent?: ReactNode;
  /** Rendered at the start of the toolbar row (before filters) */
  toolbarStartContent?: ReactNode;
};

const ListPageFilter = ({
  className,
  columnLayout,
  customRowFiltersMenu,
  data,
  filtersWithSelect = [],
  hideColumnManagement,
  hideLabelFilter,
  hideNameLabelFilters,
  loaded,
  nameFilterPlaceholder,
  onFilterChange,
  rowFilters,
  searchFilters = [],
  toolbarEndContent,
  toolbarStartContent,
}: ListPageFilterProps): null | React.ReactElement => {
  const { t } = useKubevirtTranslation();

  const [toolbarIsExpanded, setToolbarIsExpanded] = useState(false);

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

  const hasToolbarActions = toolbarEndContent || (!hideColumnManagement && columnLayout?.id);

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
        {toolbarStartContent && <ToolbarItem>{toolbarStartContent}</ToolbarItem>}
        <ToolbarToggleGroup breakpoint="md" toggleIcon={<FilterIcon />}>
          <RowFilters
            customMenu={customRowFiltersMenu}
            filters={filters}
            filtersNameMap={filtersNameMap}
            generatedRowFilters={generatedRowFilters}
            rowFilters={toolbarFilters}
            selectedRowFilters={selectedRowFilters}
            updateRowFilterSelected={updateRowFilterSelected}
          />
          {filtersWithSelect.map((filter) => (
            <CheckboxSelectFilter
              allValues={filter.items}
              applyFilters={applyTextFilters}
              categoryName={filter.filterGroupName}
              filterType={filter.type as VirtualMachineRowFilterType}
              key={filter.type}
            />
          ))}
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
        {hasToolbarActions && (
          <ListPageFilterToolbarActions
            columnLayout={columnLayout}
            hideColumnManagement={hideColumnManagement}
            toolbarEndContent={toolbarEndContent}
          />
        )}
      </ToolbarContent>
    </Toolbar>
  );
};

export default ListPageFilter;
