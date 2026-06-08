import React, { FC, useCallback, useRef } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import {
  KubevirtFilter,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, InputGroup, InputGroupItem } from '@patternfly/react-core';

import { useNavigateToSearchResults } from '../hooks/useNavigateToSearchResults';
import { useSavedSearchData } from '../hooks/useSavedSearchData';
import { AdvancedSearchInputs } from '../utils/types';

import AdvancedSearchModal from './AdvancedSearchModal/AdvancedSearchModal';
import SavedSearchesDropdown from './SavedSearchesDropdown';
import SaveSearchModal from './SaveSearchModal';
import SearchTextInput from './SearchTextInput';

import './search-bar.scss';

type SearchBarProps = {
  clearAllFilters: () => void;
  filterDefinitions: KubevirtFilter[];
  onSetFilters: OnSetFilters;
};

const SearchBar: FC<SearchBarProps> = ({ clearAllFilters, filterDefinitions, onSetFilters }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const searchInputRef = useRef<HTMLInputElement>();

  const navigateToSearchResults = useNavigateToSearchResults(onSetFilters, clearAllFilters);
  const { saveSearch, urlSearchQuery } = useSavedSearchData();

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
    <InputGroup className="pf-v6-u-mb-md" data-test="vm-adv-search-toolbar">
      <InputGroupItem isFill>
        <SearchTextInput
          filterDefinitions={filterDefinitions}
          inputRef={searchInputRef}
          onOpenAdvancedSearch={() => showSearchModal()}
          onSetFilters={onSetFilters}
        />
      </InputGroupItem>
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
