import React, { FC, useRef, useState } from 'react';

import {
  KubevirtFilter,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { InputGroup, InputGroupItem } from '@patternfly/react-core';
import useShowAdvancedSearchModal from '@search/hooks/useShowAdvancedSearchModal';

import SearchTipsPopover from './SearchTipsPopover/SearchTipsPopover';
import SavedSearchesDropdown from './SavedSearchesDropdown';
import SaveSearchButton from './SaveSearchButton';
import SearchTextInput from './SearchTextInput';

import './search-bar.scss';

type SearchBarProps = {
  clearAllFilters: () => void;
  filterDefinitions: KubevirtFilter[];
  onSetFilters: OnSetFilters;
};

const SearchBar: FC<SearchBarProps> = ({ clearAllFilters, filterDefinitions, onSetFilters }) => {
  const searchInputRef = useRef<HTMLInputElement>();
  const showSearchModal = useShowAdvancedSearchModal(onSetFilters, clearAllFilters);

  const [inputValue, setInputValue] = useState('');

  return (
    <InputGroup className="pf-v6-u-mb-md" data-test="vm-adv-search-toolbar">
      <InputGroupItem isFill>
        <SearchTextInput
          filterDefinitions={filterDefinitions}
          inputRef={searchInputRef}
          inputValue={inputValue}
          onOpenAdvancedSearch={() => showSearchModal()}
          onSetFilters={onSetFilters}
          setInputValue={setInputValue}
        />
      </InputGroupItem>
      <InputGroupItem>
        <SearchTipsPopover onSelectTip={setInputValue} />
      </InputGroupItem>
      <InputGroupItem>
        <SaveSearchButton />
      </InputGroupItem>
      <InputGroupItem>
        <SavedSearchesDropdown />
      </InputGroupItem>
    </InputGroup>
  );
};

export default SearchBar;
