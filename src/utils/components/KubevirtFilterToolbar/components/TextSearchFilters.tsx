import React, { FC, useMemo, useState } from 'react';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import AutocompleteInput from '@kubevirt-utils/components/ListPageFilter/components/AutocompleteInput';
import SearchFilter from '@kubevirt-utils/components/ListPageFilter/components/SearchFilter';
import {
  STATIC_SEARCH_FILTERS,
  STATIC_SEARCH_FILTERS_LABELS,
  STATIC_SEARCH_FILTERS_PLACEHOLDERS,
} from '@kubevirt-utils/components/ListPageFilter/constants';
import { getLabelFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/getLabelFilter';
import {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  InputGroup,
  InputGroupItem,
  SelectOption,
  ToolbarFilter,
  ToolbarItem,
} from '@patternfly/react-core';

import ToolbarFilterMultiChip from './ToolbarFilter/ToolbarFilterMultiChip';

type TextSearchFiltersProps = {
  data?: K8sResourceCommon[];
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
  searchInputText: string;
  setSearchInputText: (text: string) => void;
};

const TextSearchFilters: FC<TextSearchFiltersProps> = ({
  data,
  filters,
  onSetFilters,
  searchInputText,
  setSearchInputText,
}) => {
  const { t } = useKubevirtTranslation();

  const [searchType, setSearchType] = useState<string>(STATIC_SEARCH_FILTERS.name);

  const searchSelectOptions: Record<string, string> = useMemo(
    () => ({
      [STATIC_SEARCH_FILTERS.labels]: t('Label'),
      [STATIC_SEARCH_FILTERS.name]: t(STATIC_SEARCH_FILTERS_LABELS.name),
    }),
    [t],
  );

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
          <InputGroupItem isFill>
            <FormPFSelect
              onSelect={(_e, value: string) => setSearchType(value)}
              selected={searchType}
              selectedLabel={searchSelectOptions[searchType]}
            >
              {Object.entries(searchSelectOptions).map(([key, label]) => (
                <SelectOption key={key} value={key}>
                  {label}
                </SelectOption>
              ))}
            </FormPFSelect>
          </InputGroupItem>
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
                onSetFilters({ name: trimmedName ? [trimmedName] : [] });
              }}
              data-test="name-filter-input"
              placeholder={t(STATIC_SEARCH_FILTERS_PLACEHOLDERS.name)}
              value={searchInputText || (filters.name[0] ?? '')}
            />
          )}
        </InputGroup>
      </ToolbarFilter>

      <ToolbarFilterMultiChip
        filterDef={getLabelFilter(t)}
        filters={filters}
        onSetFilters={onSetFilters}
      >
        <></>
      </ToolbarFilterMultiChip>
    </ToolbarItem>
  );
};

export default TextSearchFilters;
