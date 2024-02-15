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
  Select,
  SelectOption,
  SelectVariant,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import ColumnManagement from '../ColumnManagementModal/ColumnManagement';

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
} from './utils';

type ListPageFilterProps = {
  columnLayout?: ColumnLayout;
  data?: K8sResourceCommon[];
  hideColumnManagement?: boolean;
  hideLabelFilter?: boolean;
  hideNameLabelFilters?: boolean;
  loaded?: boolean;
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
  loaded,
  onFilterChange,
  rowFilters,
  searchFilters = [],
}) => {
  const { t } = useKubevirtTranslation();

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

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
  };

  if (!hideLabelFilter && !hideNameLabelFilters) {
    filterDropdownItems.labels = t('Label');
  }

  if (!hideNameLabelFilters) {
    filterDropdownItems.name = t('Name');
  }

  const [searchType, setSearchType] = useState<string>(
    getInitialSearchType(searchFilters, textFilters, filterDropdownItems),
  );

  const [searchInputText, setSearchInputText] = useState<string>(
    getInitialSearchText(textFilters, searchType),
  );

  const onSelect = (event, value) => {
    setSearchInputText(getInitialSearchText(textFilters, value));
    setSearchType(value);
    setIsDropdownOpen(false);
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

  const showSearchFilters = Object.keys(filterDropdownItems).length !== 0;

  const showSearchFiltersDropdown = Object.keys(filterDropdownItems).length > 1;

  return (
    <Toolbar
      className="co-toolbar-no-padding pf-m-toggle-group-container"
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
            rowFilters={toolbarFilters}
            selectedRowFilters={selectedRowFilters}
            updateRowFilterSelected={updateRowFilterSelected}
          />
          {showSearchFilters && (
            <ToolbarItem className="co-filter-search--full-width">
              <ToolbarFilter
                deleteChip={(f, chip: string) => {
                  const newLabels = textFilters.labels.filter((label) => label !== chip);
                  applyTextFilters(STATIC_SEARCH_FILTERS.labels, newLabels.join(','));
                }}
                deleteChipGroup={() => {
                  applyTextFilters(STATIC_SEARCH_FILTERS.labels);
                }}
                categoryName={STATIC_SEARCH_FILTERS_LABELS.labels}
                chips={textFilters.labels ?? []}
              >
                {searchFilters.map((filter) => (
                  <ToolbarFilter
                    deleteChip={() => {
                      applyTextFilters(filter.type);
                      searchType === filter.type && setSearchInputText('');
                    }}
                    categoryName={filter.filterGroupName}
                    chips={textFilters[filter.type] ? [textFilters[filter.type]] : []}
                    key={filter.type}
                  >
                    <></>
                  </ToolbarFilter>
                ))}

                <ToolbarFilter
                  deleteChip={() => {
                    applyTextFilters('name');
                    searchType === STATIC_SEARCH_FILTERS.name && setSearchInputText('');
                  }}
                  categoryName={t('Name')}
                  chips={textFilters.name ? [textFilters.name] : []}
                >
                  <div className="pf-c-input-group co-filter-group">
                    {showSearchFiltersDropdown && (
                      <Select
                        placeholderText={
                          <span>
                            <FilterIcon className="span--icon__right-margin" />
                            {t('Filter')}
                          </span>
                        }
                        isOpen={isDropdownOpen}
                        onSelect={onSelect}
                        onToggle={setIsDropdownOpen}
                        selections={selectedSearchFilter?.filterGroupName || searchType}
                        variant={SelectVariant.single}
                      >
                        {Object.keys(filterDropdownItems).map((key) => (
                          <SelectOption key={key} value={key}>
                            {filterDropdownItems[key]}
                          </SelectOption>
                        ))}
                      </Select>
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
                        onChange={(newSearchInput: string) => {
                          setSearchInputText(newSearchInput);
                          applyTextFiltersWithDebounce(searchType, newSearchInput);
                        }}
                        placeholder={
                          STATIC_SEARCH_FILTERS_PLACEHOLDERS[searchType] ||
                          t('Search by {{filterName}}', {
                            filterName: selectedSearchFilter?.filterGroupName,
                          })
                        }
                        data-test={`${searchType}-filter-input`}
                        value={searchInputText || ''}
                      />
                    )}
                  </div>
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
