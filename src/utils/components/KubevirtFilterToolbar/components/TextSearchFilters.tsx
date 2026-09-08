import React, { type Dispatch, type FC, type SetStateAction, useMemo, useState } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { getLabelFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/getLabelFilter';
import {
  type FilterableObject,
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useDebounceCallback } from '@overview/utils/hooks/useDebounceCallback';
import {
  InputGroup,
  InputGroupItem,
  SelectOption,
  ToolbarFilter,
  ToolbarItem,
} from '@patternfly/react-core';

import {
  STATIC_SEARCH_FILTERS,
  STATIC_SEARCH_FILTERS_DROPDOWN_VALUES,
  STATIC_SEARCH_FILTERS_LABELS,
  STATIC_SEARCH_FILTERS_PLACEHOLDERS,
  type TextSearchFilterType,
} from '../constants';

import AutocompleteInput from './AutocompleteInput';
import SearchFilter from './SearchFilter';
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
        categoryName={t(STATIC_SEARCH_FILTERS_LABELS.name)}
        deleteLabel={() => {
          onSetFilters({ name: [] });
          searchType === STATIC_SEARCH_FILTERS.name && setSearchInputText('');
        }}
        labels={filters.name}
      >
        <InputGroup className="co-filter-group">
          {!hideLabelFilter && (
            <InputGroupItem isFill>
              <FormPFSelect
                onSelect={(_event, value: TextSearchFilterType) => setSearchType(value)}
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
              data={data}
              onSuggestionSelect={(selected) => {
                onSetFilters({ labels: [...(filters.labels ?? []), selected] });
                setSearchInputText('');
              }}
              placeholder={t(STATIC_SEARCH_FILTERS_PLACEHOLDERS.labels)}
              setTextValue={setSearchInputText}
              textValue={searchInputText}
            />
          ) : (
            <SearchFilter
              data-test="name-filter-input"
              onChange={(_event, newSearchInput: string) => {
                setSearchInputText(newSearchInput);
                const trimmedName = newSearchInput.trim();
                debouncedOnSetFilters({ name: trimmedName ? [trimmedName] : [] });
              }}
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
