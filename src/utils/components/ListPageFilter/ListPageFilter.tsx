import React, { FC, useEffect, useMemo, useState } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ColumnLayout,
  K8sResourceCommon,
  OnFilterChange,
  RowFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  InputGroup,
  InputGroupItem,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { ListManagementGroupSize } from '@virtualmachines/list/listManagementGroupSize';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import ColumnManagement from '../ColumnManagementModal/ColumnManagement';
import FormPFSelect from '../FormPFSelect/FormPFSelect';

import ProjectFilter from './components/ProjectFilter';
import { useAdvancedFiltersParameters } from './hooks/useAdvancedFiltersParameters';
import useListPageFiltersMethods from './hooks/useListPageFiltersMethods';
import { useRowFiltersParameters } from './hooks/useRowFiltersParametersType';
import { useSearchFiltersParameters } from './hooks/useSearchFiltersParameters';
import AutocompleteInput from './AutocompleteInput';
import {
  STATIC_SEARCH_FILTERS,
  STATIC_SEARCH_FILTERS_LABELS,
  STATIC_SEARCH_FILTERS_PLACEHOLDERS,
} from './constants';
import RowFilters from './RowFilters';
import SearchFilter from './SearchFilter';
import {
  Filter,
  FilterKeys,
  generateRowFilters,
  getFilterLabels,
  getFiltersData,
  getInitialSearchText,
  getInitialSearchType,
  getSearchTextPlaceholder,
} from './utils';

type ListPageFilterProps = {
  className?: string;
  columnLayout?: ColumnLayout;
  data?: K8sResourceCommon[];
  dropdownFilters?: RowFilter[];
  hideColumnManagement?: boolean;
  hideLabelFilter?: boolean;
  hideNameLabelFilters?: boolean;
  listManagementGroupSize?: ListManagementGroupSize;
  loaded?: boolean;
  nameFilterPlaceholder?: string;
  onFilterChange?: OnFilterChange;
  rowFilters?: RowFilter[];
  searchFilters?: RowFilter[];
  showProjectFilter?: boolean;
};

const ListPageFilter: FC<ListPageFilterProps> = ({
  className,
  columnLayout,
  data,
  dropdownFilters = [],
  hideColumnManagement,
  hideLabelFilter,
  hideNameLabelFilters,
  listManagementGroupSize,
  loaded,
  nameFilterPlaceholder,
  onFilterChange,
  rowFilters,
  searchFilters = [],
  showProjectFilter = false,
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
  const advancedFiltersObject = useAdvancedFiltersParameters(dropdownFilters);

  const filterDropdownItems: Record<string, string> = {
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

  const [searchType, setSearchType] = useState<string>(
    getInitialSearchType(searchFilters, textFilters, filterDropdownItems),
  );

  const [searchInputText, setSearchInputText] = useState<string>(
    getInitialSearchText(textFilters, searchType),
  );

  const onSelect = (_, value: string) => {
    setSearchInputText(getInitialSearchText(textFilters, value));
    setSearchType(value);
  };

  const applyFilters: OnFilterChange = (type, input) => onFilterChange?.(type, input);

  const { applyTextFilters, applyTextFiltersWithDebounce, clearAll, updateRowFilterSelected } =
    useListPageFiltersMethods({
      applyFilters,
      generatedRowFilters,
      onRowFilterSearchParamChange,
      searchFilters: [...searchFilters, ...dropdownFilters],
      selectedRowFilters,
      setSearchInputText,
    });

  if (!loaded) return null;

  const selectedSearchFilter = searchFilters?.find((f) => f.type === searchType);

  const filterDropdownKeys = Object.keys(filterDropdownItems);

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
          {(showProjectFilter || dropdownFilters?.length > 0) && (
            <ToolbarItem>
              {showProjectFilter && <ProjectFilter applyTextFilters={applyTextFilters} />}
              {dropdownFilters?.length > 0 &&
                dropdownFilters
                  .filter((filter) => filter.type !== VirtualMachineRowFilterType.Project)
                  .map((filter) => (
                    <ToolbarFilter
                      categoryName={filter.filterGroupName}
                      deleteLabel={() => applyTextFilters(filter.type)}
                      key={filter.type}
                      labels={getFilterLabels(filter, advancedFiltersObject[filter.type])}
                    >
                      <></>
                    </ToolbarFilter>
                  ))}
            </ToolbarItem>
          )}
          {filterDropdownKeys.length !== 0 && (
            <ToolbarItem className="co-filter-search--full-width">
              <ToolbarFilter
                deleteLabel={() => {
                  applyTextFilters('name');
                  searchType === STATIC_SEARCH_FILTERS.name && setSearchInputText('');
                }}
                categoryName={t('Name')}
                labels={textFilters.name ? [textFilters.name] : []}
              >
                <InputGroup className="co-filter-group">
                  {filterDropdownKeys.length > 1 && (
                    <InputGroupItem isFill>
                      <FormPFSelect
                        onSelect={onSelect}
                        selected={searchType}
                        selectedLabel={filterDropdownItems?.[searchType]}
                      >
                        {filterDropdownKeys.map((key) => (
                          <SelectOption key={key} value={key}>
                            {filterDropdownItems?.[key]}
                          </SelectOption>
                        ))}
                      </FormPFSelect>
                    </InputGroupItem>
                  )}

                  {searchType === STATIC_SEARCH_FILTERS.labels ? (
                    <AutocompleteInput
                      onSuggestionSelect={(selected) => {
                        const newLabels = new Set([...textFilters.labels, selected]);
                        applyTextFilters(
                          STATIC_SEARCH_FILTERS.labels,
                          Array.from(newLabels).join(','),
                        );
                        setSearchInputText('');
                      }}
                      className="co-text-node"
                      data={data}
                      placeholder={STATIC_SEARCH_FILTERS_PLACEHOLDERS.labels}
                      setTextValue={setSearchInputText}
                      textValue={searchInputText}
                    />
                  ) : (
                    <SearchFilter
                      onChange={(_, newSearchInput: string) => {
                        setSearchInputText(newSearchInput);
                        applyTextFiltersWithDebounce(searchType, newSearchInput);
                      }}
                      placeholder={getSearchTextPlaceholder(
                        searchType,
                        selectedSearchFilter,
                        nameFilterPlaceholder,
                      )}
                      data-test={`${searchType}-filter-input`}
                      value={searchInputText || ''}
                    />
                  )}
                </InputGroup>
              </ToolbarFilter>

              <ToolbarFilter
                deleteLabel={(category, labelToDelete: string) => {
                  const newLabels = textFilters?.labels?.filter((label) => label !== labelToDelete);
                  applyTextFilters(STATIC_SEARCH_FILTERS.labels, newLabels.join(','));
                }}
                deleteLabelGroup={() => {
                  applyTextFilters(STATIC_SEARCH_FILTERS.labels);
                }}
                categoryName={STATIC_SEARCH_FILTERS_LABELS.labels}
                labels={textFilters.labels ?? []}
              >
                <></>
              </ToolbarFilter>

              {searchFilters.map((filter) => (
                <ToolbarFilter
                  deleteLabel={() => {
                    applyTextFilters(filter.type);
                    searchType === filter.type && setSearchInputText('');
                  }}
                  categoryName={filter.filterGroupName}
                  key={filter.type}
                  labels={textFilters[filter.type] ? [textFilters[filter.type]] : []}
                >
                  <></>
                </ToolbarFilter>
              ))}
            </ToolbarItem>
          )}
        </ToolbarToggleGroup>
        <ColumnManagement columnLayout={columnLayout} hideColumnManagement={hideColumnManagement} />
      </ToolbarContent>
    </Toolbar>
  );
};

export default ListPageFilter;
