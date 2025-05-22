import React, { Dispatch, FC, SetStateAction } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import {
  InputGroup,
  InputGroupItem,
  SelectOption,
  SelectProps,
  ToolbarFilter,
  ToolbarItem,
} from '@patternfly/react-core';

import {
  STATIC_SEARCH_FILTERS,
  STATIC_SEARCH_FILTERS_LABELS,
  STATIC_SEARCH_FILTERS_PLACEHOLDERS,
} from '../constants';
import { ApplyTextFilters, TextFiltersType } from '../types';
import { getFilterLabels, getSearchTextPlaceholder } from '../utils';

import AutocompleteInput from './AutocompleteInput';
import SearchFilter from './SearchFilter';

type TextFiltersToolbarItemProps = {
  applyTextFilters: ApplyTextFilters;
  applyTextFiltersWithDebounce: ApplyTextFilters;
  data: K8sResourceCommon[];
  nameFilterPlaceholder: string;
  onSelect: SelectProps['onSelect'];
  searchFilters: RowFilter[];
  searchInputText: string;
  searchType: string;
  selectOptionNames: Record<string, string>;
  setSearchInputText: Dispatch<SetStateAction<string>>;
  textFilters: TextFiltersType;
};

const TextFiltersToolbarItem: FC<TextFiltersToolbarItemProps> = ({
  applyTextFilters,
  applyTextFiltersWithDebounce,
  data,
  nameFilterPlaceholder,
  onSelect,
  searchFilters,
  searchInputText,
  searchType,
  selectOptionNames,
  setSearchInputText,
  textFilters,
}) => {
  const selectOptionKeys = Object.keys(selectOptionNames);
  const selectedSearchFilter = searchFilters?.find((f) => f.type === searchType);

  if (isEmpty(selectOptionKeys)) {
    return null;
  }

  return (
    <ToolbarItem className="co-filter-search--full-width">
      <ToolbarFilter
        deleteLabel={() => {
          applyTextFilters('name');
          searchType === STATIC_SEARCH_FILTERS.name && setSearchInputText('');
        }}
        categoryName={STATIC_SEARCH_FILTERS_LABELS.name}
        labels={getFilterLabels(textFilters.name)}
      >
        <InputGroup className="co-filter-group">
          {selectOptionKeys.length > 1 && (
            <InputGroupItem isFill>
              <FormPFSelect
                onSelect={onSelect}
                selected={searchType}
                selectedLabel={selectOptionNames[searchType]}
              >
                {selectOptionKeys.map((key) => (
                  <SelectOption key={key} value={key}>
                    {selectOptionNames[key]}
                  </SelectOption>
                ))}
              </FormPFSelect>
            </InputGroupItem>
          )}

          {searchType === STATIC_SEARCH_FILTERS.labels ? (
            <AutocompleteInput
              onSuggestionSelect={(selected) => {
                applyTextFilters(STATIC_SEARCH_FILTERS.labels, [...textFilters.labels, selected]);
                setSearchInputText('');
              }}
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
        deleteLabel={(_, labelToDelete: string) => {
          const newLabels = textFilters?.labels?.filter((label) => label !== labelToDelete);
          applyTextFilters(STATIC_SEARCH_FILTERS.labels, newLabels);
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
          labels={getFilterLabels(textFilters[filter.type])}
        >
          <></>
        </ToolbarFilter>
      ))}
    </ToolbarItem>
  );
};

export default TextFiltersToolbarItem;
