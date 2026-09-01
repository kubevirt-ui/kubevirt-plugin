/* eslint-disable */
import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import {
  STATIC_SEARCH_FILTERS,
  STATIC_SEARCH_FILTERS_DROPDOWN_VALUES,
  STATIC_SEARCH_FILTERS_LABELS,
  STATIC_SEARCH_FILTERS_PLACEHOLDERS,
  TextSearchFilterType,
} from '../constants';

import { getLabelFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/getLabelFilter';
import {
  FilterableObject,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  InputGroup,
  InputGroupItem,
  SelectOption,
  ToolbarFilter,
  ToolbarItem,
} from '@patternfly/react-core';
import AutocompleteInput from './AutocompleteInput';
import SearchFilter from './SearchFilter';

import { useDebounceCallback } from '@overview/utils/hooks/useDebounceCallback';
import ToolbarFilterMultiChip from './ToolbarFilter/ToolbarFilterMultiChip';

type TextSearchFiltersProps = {
  data?: FilterableObject[];
  filters: KubevirtFilterState;
  hideLabelFilter?: boolean;
  onSetFilters: OnSetFilters;
  searchInputText: string;
  setSearchInputText: Dispatch<SetStateAction<string>>;
};

const TextSearchFilters: FC<TextSearchFiltersProps> = ({
  data,
  filters,
  hideLabelFilter,
  onSetFilters,
  searchInputText,
  setSearchInputText,
}) => {
  const { t } = useKubevirtTranslation();

  const [searchType, setSearchType] = useState<TextSearchFilterType>(STATIC_SEARCH_FILTERS.name);

  const searchSelectOptions: Record<TextSearchFilterType, string> = useMemo(
    () => ({
      [STATIC_SEARCH_FILTERS.labels]: t('Label'),
      [STATIC_SEARCH_FILTERS.name]: t(STATIC_SEARCH_FILTERS_LABELS.name),
    }),
    [t],
  );

  const debouncedOnSetFilters = useDebounceCallback(onSetFilters, 250);

  return (
    <ToolbarItem className="co-filter-search--full-width">
      <ToolbarFilter
        deleteLabel={() => {
          onSetFilters({ name: [] });
          searchType === STATIC_SEARCH_FILTERS.name && setSearchInputText('');
        }}
        categoryName={t(STATIC_SEARCH_FILTERS_LABELS.name)}
        labels={filters.name}
      >
        <InputGroup className="co-filter-group">
          {!hideLabelFilter && (
            <InputGroupItem isFill>
              <FormPFSelect
                onSelect={(_e, value: TextSearchFilterType) => setSearchType(value)}
                selected={searchType}
                selectedLabel={searchSelectOptions[searchType]}
              >
                {STATIC_SEARCH_FILTERS_DROPDOWN_VALUES.map((key) => (
                  <SelectOption key={key} value={key}>
                    {searchSelectOptions[key]}
                  </SelectOption>
                ))}
              </FormPFSelect>
            </InputGroupItem>
          )}
          {searchType === STATIC_SEARCH_FILTERS.labels ? (
            <AutocompleteInput
              onSuggestionSelect={(selected) => {
                onSetFilters({ labels: [...(filters.labels ?? []), selected] });
                setSearchInputText('');
              }}
              data={data}
              placeholder={t(STATIC_SEARCH_FILTERS_PLACEHOLDERS.labels)}
              setTextValue={setSearchInputText}
              textValue={searchInputText}
            />
          ) : (
            <SearchFilter
              onChange={(_, newSearchInput: string) => {
                setSearchInputText(newSearchInput);
                const trimmedName = newSearchInput.trim();
                debouncedOnSetFilters({ name: trimmedName ? [trimmedName] : [] });
              }}
              data-test="name-filter-input"
              placeholder={t(STATIC_SEARCH_FILTERS_PLACEHOLDERS.name)}
              value={searchInputText}
            />
          )}
        </InputGroup>
      </ToolbarFilter>

      {!hideLabelFilter && (
        <ToolbarFilterMultiChip
          filterDef={getLabelFilter(t)}
          filters={filters}
          onSetFilters={onSetFilters}
        >
          <></>
        </ToolbarFilterMultiChip>
      )}
    </ToolbarItem>
  );
};

export default TextSearchFilters;
