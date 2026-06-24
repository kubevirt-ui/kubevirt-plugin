import React, { FC } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import FilteredKeyList from './components/FilteredKeyList';
import OperatorList from './components/OperatorList';
import RecentSearches from './components/RecentSearches';
import SearchByKeys from './components/SearchByKeys/SearchByKeys';
import SearchDropdownMenu from './components/SearchDropdownMenu';
import SearchExamples from './components/SearchExamples';
import SearchValueList from './components/SearchValueList';
import { getSectionFocusIndices } from './hooks/useDefaultMenuNavigation/utils';
import useSearchKeyBadges from './hooks/useSearchKeyBadges';
import { AutocompleteMode, DropdownType, SearchKeyBadge } from './types';
import { hasActiveKeyFilter, toValueOptions } from './utils';

import './search-dropdown.scss';

type SearchDropdownProps = {
  autocompleteMode: AutocompleteMode;
  filterDefinitions: KubevirtFilter[];
  focusedItemIndex: number;
  onSelectKey: (badge: SearchKeyBadge) => void;
  onSelectOperator: (operator: string) => void;
  onSelectQueryText: (query: string) => void;
  onSelectValue: (value: string) => void;
  onToggleShowAllExamples: () => void;
  recentSearches: string[];
  showAllExamples: boolean;
};

const SearchDropdown: FC<SearchDropdownProps> = ({
  autocompleteMode,
  filterDefinitions,
  focusedItemIndex,
  onSelectKey,
  onSelectOperator,
  onSelectQueryText,
  onSelectValue,
  onToggleShowAllExamples,
  recentSearches,
  showAllExamples,
}) => {
  const searchKeyBadges = useSearchKeyBadges();
  const { type } = autocompleteMode;
  if (type === DropdownType.HIDDEN) return null;

  if (type === DropdownType.OPERATORS) {
    const { searchKey } = autocompleteMode;
    return (
      <SearchDropdownMenu role="listbox">
        <OperatorList
          focusedItemIndex={focusedItemIndex}
          onSelectOperator={onSelectOperator}
          searchKey={searchKey}
        />
      </SearchDropdownMenu>
    );
  }

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

  const { examplesFocusedIndex, keysFocusedIndex, recentFocusedIndex } = getSectionFocusIndices(
    focusedItemIndex,
    searchKeyBadges.length,
    recentSearches.length,
  );

  return (
    <SearchDropdownMenu>
      <SearchByKeys
        filterDefinitions={filterDefinitions}
        focusedItemIndex={keysFocusedIndex}
        onSelectKey={onSelectKey}
      />
      <RecentSearches
        focusedItemIndex={recentFocusedIndex}
        onSelectRecentSearch={onSelectQueryText}
        recentSearches={recentSearches}
      />
      <SearchExamples
        focusedItemIndex={examplesFocusedIndex}
        onSelectExample={onSelectQueryText}
        onToggleShowAll={onToggleShowAllExamples}
        showAll={showAllExamples}
      />
    </SearchDropdownMenu>
  );
};

export default SearchDropdown;
