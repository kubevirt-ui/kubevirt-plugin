import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';

import { ResetTextSearch } from '@kubevirt-utils/components/ListPageFilter/types';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  InputGroup,
  InputGroupItem,
  Menu,
  Popper,
  SearchInput,
  SearchInputProps,
  Tooltip,
} from '@patternfly/react-core';
import SlidersHIcon from '@patternfly/react-icons/dist/esm/icons/sliders-h-icon';
import { SearchSuggestResult } from '@search/utils/types';
import { useVirtualMachineSearchSuggestions } from '@virtualmachines/search/hooks/useVirtualMachineSearchSuggestions';

import { useNavigateToSearchResults } from '../hooks/useNavigateToSearchResults';
import { useSavedSearchData } from '../hooks/useSavedSearchData';
import { AdvancedSearchInputs } from '../utils/types';

import AdvancedSearchModal from './AdvancedSearchModal/AdvancedSearchModal';
import SearchSuggestBox from './SearchSuggestBox/SearchSuggestBox';
import SavedSearchesDropdown from './SavedSearchesDropdown';
import SaveSearchModal from './SaveSearchModal';

import './search-bar.scss';

type SearchBarProps = {
  onFilterChange: OnFilterChange;
  resetTextSearch?: ResetTextSearch;
};

const SearchBar: FC<SearchBarProps> = ({ onFilterChange, resetTextSearch }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchSuggestBoxOpen, setIsSearchSuggestBoxOpen] = useState(false);
  const [isSearchInProgress, setIsSearchInProgress] = useState(false);
  const [searchSuggestResult, setSearchSuggestResult] = useState<SearchSuggestResult>();

  const searchInputRef = useRef<HTMLInputElement>();
  const searchSuggestBoxRef = useRef<HTMLDivElement>();

  const [vmSuggestions, vmSuggestionsLoaded] = useVirtualMachineSearchSuggestions(searchQuery);
  const navigateToSearchResults = useNavigateToSearchResults(onFilterChange, resetTextSearch);
  const { saveSearch, urlSearchQuery } = useSavedSearchData();

  useEffect(() => {
    if (searchQuery) {
      setIsSearchSuggestBoxOpen(true);
      setIsSearchInProgress(!vmSuggestionsLoaded);
      setSearchSuggestResult(vmSuggestions);
    } else {
      setIsSearchSuggestBoxOpen(false);
      setIsSearchInProgress(false);
      setSearchSuggestResult(undefined);
    }
  }, [searchQuery, vmSuggestions, vmSuggestionsLoaded]);

  const onSearchInputChange = debounce<SearchInputProps['onChange']>((_, value) => {
    setSearchQuery(value);
  }, 500);

  const onSearchInputClear = () => {
    setSearchQuery('');
  };

  const showSearchModal = useCallback(
    (prefillInputs?: AdvancedSearchInputs) => {
      createModal(({ isOpen, onClose }) => (
        <AdvancedSearchModal
          onSubmit={(searchInputs) => {
            navigateToSearchResults(searchInputs);
            onClose();
          }}
          isOpen={isOpen}
          onClose={onClose}
          prefillInputs={prefillInputs}
        />
      ));
    },
    [createModal, navigateToSearchResults],
  );

  const showSaveSearchModal = useCallback(() => {
    createModal(({ isOpen, onClose }) => (
      <SaveSearchModal
        onSubmit={({ description, name }) => {
          saveSearch(name, { description, query: urlSearchQuery });
          onClose();
        }}
        isOpen={isOpen}
        onClose={onClose}
      />
    ));
  }, [createModal, saveSearch, urlSearchQuery]);

  return (
    <InputGroup className="vm-search-bar">
      <Popper
        popper={
          <Menu
            aria-label={t('Search suggest box')}
            className="pf-v6-u-py-0"
            ref={searchSuggestBoxRef}
            role="dialog"
          >
            <SearchSuggestBox
              isSearchInProgress={isSearchInProgress}
              navigateToSearchResults={navigateToSearchResults}
              searchQuery={searchQuery}
              searchSuggestResult={searchSuggestResult}
              showSearchModal={showSearchModal}
            />
          </Menu>
        }
        trigger={
          <SearchInput
            id="vm-search-input"
            onChange={onSearchInputChange}
            onClear={onSearchInputClear}
            onClick={() => searchQuery && setIsSearchSuggestBoxOpen(true)}
            placeholder={t('Search VirtualMachines')}
            ref={searchInputRef}
            value={searchQuery}
          />
        }
        appendTo={() => document.querySelector('#vm-search-input')}
        enableFlip={false}
        isVisible={isSearchSuggestBoxOpen}
        onDocumentClick={() => setIsSearchSuggestBoxOpen(false)}
        popperRef={searchSuggestBoxRef}
        triggerRef={searchInputRef}
      />
      <Tooltip content={t('Advanced search')}>
        <Button
          onClick={() => {
            showSearchModal();
          }}
          icon={<SlidersHIcon />}
          variant="control"
        />
      </Tooltip>
      <InputGroupItem>
        <Button isDisabled={!urlSearchQuery} onClick={showSaveSearchModal} variant="link">
          {t('Save search')}
        </Button>
      </InputGroupItem>
      <InputGroupItem>
        <SavedSearchesDropdown />
      </InputGroupItem>
    </InputGroup>
  );
};

export default SearchBar;
