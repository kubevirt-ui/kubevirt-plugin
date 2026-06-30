import React, { FC, RefObject, useCallback, useMemo } from 'react';

import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { InputGroup, InputGroupItem } from '@patternfly/react-core';
import useShowAdvancedSearchModal from '@search/hooks/useShowAdvancedSearchModal';
import { useSearchLanguageInput } from '@search/searchLanguage/hooks/useSearchLanguageInput/useSearchLanguageInput';
import { convertFilterStateToModalInputs } from '@search/utils/query';

import useRecentSearches from './SearchDropdown/hooks/useRecentSearches';
import SearchTipsPopover from './SearchTipsPopover/SearchTipsPopover';
import SavedSearchesDropdown from './SavedSearchesDropdown';
import SaveSearchButton from './SaveSearchButton';
import SearchTextInput from './SearchTextInput';

import './search-bar.scss';

type SearchBarProps = {
  clearAllFilters: () => void;
  filterDefinitions: KubevirtFilter[];
  filters: KubevirtFilterState;
  inputRef?: RefObject<HTMLInputElement>;
  onSetFilters: OnSetFilters;
};

const SearchBar: FC<SearchBarProps> = ({
  clearAllFilters,
  filterDefinitions,
  filters,
  inputRef,
  onSetFilters,
}) => {
  const showSearchModal = useShowAdvancedSearchModal(onSetFilters, clearAllFilters);
  const modalInputs = useMemo(() => convertFilterStateToModalInputs(filters), [filters]);

  const { addRecentSearch, recentSearches } = useRecentSearches();

  const { onCommitText, ...searchInputProps } = useSearchLanguageInput({
    addRecentSearch,
    clearAllFilters,
    filterDefinitions,
    filters,
    onSetFilters,
  });

  const onSelectQueryText = useCallback(
    (token: string) => {
      onCommitText(token, { closeDropdown: true });
    },
    [onCommitText],
  );

  return (
    <InputGroup className="pf-v6-u-mb-md" data-test="vm-adv-search-toolbar">
      <InputGroupItem isFill>
        <SearchTextInput
          filterDefinitions={filterDefinitions}
          filters={filters}
          inputRef={inputRef}
          onOpenAdvancedSearch={() => showSearchModal(modalInputs)}
          onSelectQueryText={onSelectQueryText}
          onSetFilters={onSetFilters}
          recentSearches={recentSearches}
          {...searchInputProps}
        />
      </InputGroupItem>
      <InputGroupItem>
        <SearchTipsPopover onSelectTip={onSelectQueryText} />
      </InputGroupItem>
      <InputGroupItem>
        <SaveSearchButton filters={filters} onSetFilters={onSetFilters} />
      </InputGroupItem>
      <InputGroupItem>
        <SavedSearchesDropdown filters={filters} onSetFilters={onSetFilters} />
      </InputGroupItem>
    </InputGroup>
  );
};

export default SearchBar;
