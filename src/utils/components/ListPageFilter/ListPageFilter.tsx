import React, { FC, useMemo, useState } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ColumnLayout,
  FilterValue,
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

import ColumnManagement from '../ColumnManagementModal/ColumnManagement';
import FormPFSelect from '../FormPFSelect/FormPFSelect';

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
  getFiltersData,
  getInitialSearchText,
  getInitialSearchType,
  getSearchTextPlaceholder,
} from './utils';

type ListPageFilterProps = {
  columnLayout?: ColumnLayout;
  data?: K8sResourceCommon[];
  hideColumnManagement?: boolean;
  hideLabelFilter?: boolean;
  hideNameLabelFilters?: boolean;
  listManagementGroupSize?: ListManagementGroupSize;
  loaded?: boolean;
  nameFilterPlaceholder?: string;
  onFilterChange?: OnFilterChange;
  rowFilters?: RowFilter[];
  searchFilters?: RowFilter[];
};

const ListPageFilter: FC<ListPageFilterProps> = ({
  columnLayout,
  data,
  hideColumnManagement,
  hideLabelFilter,
  hideNameLabelFilters,
  listManagementGroupSize,
  loaded,
  nameFilterPlaceholder,
  onFilterChange,
  rowFilters,
  searchFilters = [],
}) => {
  const { t } = useKubevirtTranslation();

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

  const applyFilters = (type: string, input: FilterValue) => onFilterChange?.(type, input);

  const { applyTextFilters, applyTextFiltersWithDebounce, clearAll, updateRowFilterSelected } =
    useListPageFiltersMethods({
      applyFilters,
      generatedRowFilters,
      onRowFilterSearchParamChange,
      searchFilters,
      selectedRowFilters,
      setSearchInputText,
    });

  if (!loaded) return null;

  const selectedSearchFilter = searchFilters?.find((f) => f.type === searchType);

  const filterDropdownKeys = Object.keys(filterDropdownItems);

  return (
    <Toolbar
      clearAllFilters={clearAll}
      clearFiltersButtonText={t('Clear all filters')}
      data-test="filter-toolbar"
      id="filter-toolbar"
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
          {filterDropdownKeys.length !== 0 && (
            <ToolbarItem className="co-filter-search--full-width">
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
              </ToolbarFilter>
            </ToolbarItem>
          )}
        </ToolbarToggleGroup>
        <ColumnManagement columnLayout={columnLayout} hideColumnManagement={hideColumnManagement} />
      </ToolbarContent>
    </Toolbar>
  );
};

export default ListPageFilter;
