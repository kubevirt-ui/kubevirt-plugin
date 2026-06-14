import React, { FC } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import FilteredKeyList from './components/FilteredKeyList';
import RecentSearches from './components/RecentSearches';
import SearchByKeys from './components/SearchByKeys';
import SearchDropdownMenu from './components/SearchDropdownMenu';
import SearchExamples from './components/SearchExamples';
import SearchValueList from './components/SearchValueList';
import { AutocompleteMode, DropdownType, SearchKeyBadge } from './types';
import { hasActiveKeyFilter, toValueOptions } from './utils';

import './search-dropdown.scss';

type SearchDropdownProps = {
  autocompleteMode: AutocompleteMode;
  filterDefinitions: KubevirtFilter[];
  focusedItemIndex: number;
  onSelectExample: (query: string) => void;
  onSelectKey: (badge: SearchKeyBadge) => void;
  onSelectRecentSearch: (token: string) => void;
  onSelectValue: (value: string) => void;
  recentSearches: string[];
};

const SearchDropdown: FC<SearchDropdownProps> = ({
  autocompleteMode,
  filterDefinitions,
  focusedItemIndex,
  onSelectExample,
  onSelectKey,
  onSelectRecentSearch,
  onSelectValue,
  recentSearches,
}) => {
  const { type } = autocompleteMode;
  if (type === DropdownType.HIDDEN) return null;

  if (type === DropdownType.VALUES) {
    const { activeSegment, filterType, selectedValues } = autocompleteMode;
    const options = toValueOptions(filterDefinitions, filterType);

    return (
      <SearchDropdownMenu role="listbox">
        <SearchValueList
          activeSegment={activeSegment}
          filterType={filterType}
          focusedItemIndex={focusedItemIndex}
          onSelectValue={onSelectValue}
          options={options}
          selectedValues={selectedValues}
        />
      </SearchDropdownMenu>
    );
  }

  const { filterText } = autocompleteMode;

  if (hasActiveKeyFilter(filterText)) {
    return (
      <SearchDropdownMenu>
        <FilteredKeyList
          filterText={filterText}
          focusedItemIndex={focusedItemIndex}
          onSelectKey={onSelectKey}
        />
      </SearchDropdownMenu>
    );
  }

  return (
    <SearchDropdownMenu>
      <SearchByKeys filterDefinitions={filterDefinitions} onSelectKey={onSelectKey} />
      <RecentSearches onSelectRecentSearch={onSelectRecentSearch} recentSearches={recentSearches} />
      <SearchExamples onSelectExample={onSelectExample} />
    </SearchDropdownMenu>
  );
};

export default SearchDropdown;
