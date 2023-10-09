import React, { FC, useMemo, useState } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
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
} from './utils';

type ListPageFilterProps = {
  data?: K8sResourceCommon[];
  loaded?: boolean;
  onFilterChange?: OnFilterChange;
  rowFilters?: RowFilter[];
};

const ListPageFilter: FC<ListPageFilterProps> = ({ data, loaded, onFilterChange, rowFilters }) => {
  const { t } = useKubevirtTranslation();

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Generate rowFilter items and counts. Memoize to minimize re-renders.
  const generatedRowFilters = useDeepCompareMemoize(generateRowFilters(rowFilters ?? [], data));

  // Reduce generatedRowFilters once and memoize
  const [filters, filtersNameMap, filterKeys] = useMemo<[Filter, FilterKeys, FilterKeys, string[]]>(
    () => getFiltersData(generatedRowFilters),
    [generatedRowFilters],
  );

  const [selectedRowFilters, onRowFilterSearchParamChange] = useRowFiltersParameters({
    filterKeys,
    filters,
  });

  const textFilters = useSearchFiltersParameters();

  const [searchType, setSearchType] = useState<keyof typeof STATIC_SEARCH_FILTERS>(
    STATIC_SEARCH_FILTERS.name,
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
      selectedRowFilters,
      setSearchInputText,
    });

  if (!loaded) return null;

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
            rowFilters={rowFilters}
            selectedRowFilters={selectedRowFilters}
            updateRowFilterSelected={updateRowFilterSelected}
          />
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
              <ToolbarFilter
                deleteChip={() => {
                  applyTextFilters('name');
                  searchType === STATIC_SEARCH_FILTERS.name && setSearchInputText('');
                }}
                categoryName={t('Name')}
                chips={textFilters.name ? [textFilters.name] : []}
              >
                <div className="pf-c-input-group co-filter-group">
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
                    selections={searchType}
                    variant={SelectVariant.single}
                  >
                    <SelectOption value={STATIC_SEARCH_FILTERS.name}>
                      {STATIC_SEARCH_FILTERS_LABELS.name}
                    </SelectOption>

                    <SelectOption value={STATIC_SEARCH_FILTERS.labels}>
                      {STATIC_SEARCH_FILTERS_LABELS.labels}
                    </SelectOption>
                  </Select>

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
                      data-test={`${searchType}-filter-input`}
                      placeholder={STATIC_SEARCH_FILTERS_PLACEHOLDERS.name}
                      value={searchInputText}
                    />
                  )}
                </div>
              </ToolbarFilter>
            </ToolbarFilter>
          </ToolbarItem>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default ListPageFilter;