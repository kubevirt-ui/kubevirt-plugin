import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import debounce from 'lodash/debounce';

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
};

const SearchBar: FC<SearchBarProps> = ({ onFilterChange }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchSuggestBoxOpen, setIsSearchSuggestBoxOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>();
  const searchSuggestBoxRef = useRef<HTMLDivElement>();

  const [vmSuggestions, vmSuggestionsLoaded] = useVirtualMachineSearchSuggestions(searchQuery);
  const navigateToSearchResults = useNavigateToSearchResults(onFilterChange);
  const { saveSearch, urlSearchQuery } = useSavedSearchData();

  const searchSuggestResult: SearchSuggestResult | undefined = useMemo(() => {
    if (!searchQuery) {
      return undefined;
    }
    return vmSuggestions;
  }, [searchQuery, vmSuggestions]);

  useEffect(() => {
    if (searchQuery) {
      setIsSearchSuggestBoxOpen(true);
    } else {
      setIsSearchSuggestBoxOpen(false);
    }
  }, [searchQuery]);
  const isSearchInProgress = useMemo(() => {
    return searchQuery ? !vmSuggestionsLoaded : false;
  }, [searchQuery, vmSuggestionsLoaded]);

  const onSearchInputChange = debounce<SearchInputProps['onChange']>((_, value) => {
    setSearchQuery(value);
  }, 500);

  const onSearchInputClear = () => {
    setSearchQuery('');
  };

  const onEnterKeyDown = () => {
    if (isSearchSuggestBoxOpen && searchSuggestResult?.resources.length > 0) {
      navigateToSearchResults({ name: searchQuery });
      setIsSearchSuggestBoxOpen(false);
    }
    if (!isSearchSuggestBoxOpen) {
      setIsSearchSuggestBoxOpen(true);
    }
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
    <InputGroup className="vm-search-bar" data-test="vm-adv-search-toolbar">
      <Popper
        popper={
          <Menu
            aria-label={t('Search suggest box')}
            className="pf-v6-u-py-0"
            data-test="search-results"
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
            onKeyDown={(e) => {
              if (!searchQuery) {
                return;
              }
              if (e.key === 'Enter') {
                onEnterKeyDown();
              }
              if (e.key === 'Escape') {
                setIsSearchSuggestBoxOpen(false);
              }
            }}
            data-test="vm-search-input"
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
          data-test="vm-advanced-search"
          icon={<SlidersHIcon />}
          variant="control"
        />
      </Tooltip>
      <InputGroupItem>
        <Button
          data-test="save-search"
          isDisabled={!urlSearchQuery}
          onClick={showSaveSearchModal}
          variant="link"
        >
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
