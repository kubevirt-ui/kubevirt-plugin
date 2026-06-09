import React, { FC } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { Menu, MenuContent } from '@patternfly/react-core';

import RecentSearches from './components/RecentSearches';
import SearchByKeys from './components/SearchByKeys';
import SearchDropdownFooter from './components/SearchDropdownFooter';
import SearchExamples from './components/SearchExamples';

import './search-dropdown.scss';

type SearchDropdownProps = {
  filterDefinitions: KubevirtFilter[];
  onSelectExample: (query: string) => void;
  onSelectKey: (key: string) => void;
  onSelectRecentSearch: (token: string) => void;
  recentSearches: string[];
};

const SearchDropdown: FC<SearchDropdownProps> = ({
  filterDefinitions,
  onSelectExample,
  onSelectKey,
  onSelectRecentSearch,
  recentSearches,
}) => (
  <Menu className="search-dropdown">
    <MenuContent className="search-dropdown__content">
      <SearchByKeys filterDefinitions={filterDefinitions} onSelectKey={onSelectKey} />
      <RecentSearches onSelectRecentSearch={onSelectRecentSearch} recentSearches={recentSearches} />
      <SearchExamples onSelectExample={onSelectExample} />
    </MenuContent>
    <SearchDropdownFooter />
  </Menu>
);

export default SearchDropdown;
