import React, { useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Toolbar, ToolbarContent, ToolbarToggleGroup } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { type VirtualMachineRowFilterType } from '@virtualmachines/utils';

import CheckboxSelectFilter from './components/CheckboxSelectFilter';
import ListPageFilterToolbarActions from './components/ListPageFilterToolbarActions';
import RowFilters from './components/RowFilters';
import TextFiltersToolbarItem from './components/TextFiltersToolbarItem';
import useListPageFilterState from './hooks/useListPageFilterState';
import { type ListPageFilterProps } from './types';

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

  const {
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
  } = useListPageFilterState({
    data,
    hideLabelFilter,
    hideNameLabelFilters,
    onFilterChange,
    rowFilters,
    searchFilters,
  });

  const hasToolbarActions =
    Boolean(toolbarEndContent) || Boolean(!hideColumnManagement && columnLayout?.id);

  if (!loaded) return null;

  return (
    <Toolbar
      className={className}
      clearAllFilters={clearAll}
      clearFiltersButtonText={t('Clear all filters')}
      data-test="filter-toolbar"
      id="filter-toolbar"
      isExpanded={toolbarIsExpanded}
      toggleIsExpanded={() => {
        setToolbarIsExpanded(!toolbarIsExpanded);
      }}
    >
      <ToolbarContent>
        {toolbarStartContent}
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
