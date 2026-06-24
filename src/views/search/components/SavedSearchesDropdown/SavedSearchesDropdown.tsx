import React, { FC, useMemo, useState } from 'react';

import {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  SearchInput,
} from '@patternfly/react-core';
import { useSavedSearchData } from '@search/hooks/useSavedSearchData';
import { applySearch } from '@search/savedSearches/utils';

import SavedSearchesStateHandler from './components/SavedSearchesStateHandler';
import SavedSearchItem from './components/SavedSearchItem';
import useDeleteSavedSearch from './hooks/useDeleteSavedSearch';

type SavedSearchesDropdownProps = {
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
};

const SavedSearchesDropdown: FC<SavedSearchesDropdownProps> = ({ filters, onSetFilters }) => {
  const { t } = useKubevirtTranslation();

  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  const { deleteSearch, searches, searchesInitiallyLoaded, searchesLoadError, toggleFavorite } =
    useSavedSearchData();

  const handleDelete = useDeleteSavedSearch(deleteSearch, setOpen);

  const filteredSearches = useMemo(() => {
    const sorted = [...searches].sort((a, b) => Number(b.isFavorited) - Number(a.isFavorited));
    if (!filterText) return sorted;
    const lower = filterText.toLowerCase();
    return sorted.filter(({ name }) => name.toLowerCase().includes(lower));
  }, [searches, filterText]);

  return (
    <Dropdown
      onOpenChange={(isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
          setFilterText('');
        }
      }}
      toggle={(toggleRef) => (
        <MenuToggle isExpanded={open} onClick={() => setOpen(!open)} ref={toggleRef}>
          {t('Saved searches')}
        </MenuToggle>
      )}
      isOpen={open}
      popperProps={{ position: 'end' }}
    >
      <SavedSearchesStateHandler
        loaded={searchesInitiallyLoaded}
        loadError={searchesLoadError}
        searches={searches}
      >
        <MenuSearch>
          <MenuSearchInput>
            <SearchInput
              onChange={(_, value) => setFilterText(value)}
              placeholder={t('Find by name')}
              value={filterText}
            />
          </MenuSearchInput>
        </MenuSearch>
        <Divider />
        <DropdownList className="saved-searches-dropdown-menu" data-test="saved-searches">
          {isEmpty(filteredSearches) ? (
            <DropdownItem isDisabled key="no-results">
              {t('No saved searches match "{{filterText}}".', { filterText })}
            </DropdownItem>
          ) : (
            filteredSearches.map(({ description, isFavorited, name }) => (
              <SavedSearchItem
                onApply={() => {
                  applySearch(name, searches, filters, onSetFilters);
                  setOpen(false);
                }}
                description={description}
                isFavorited={isFavorited}
                key={name}
                name={name}
                onDelete={() => handleDelete(name, isFavorited)}
                onToggleFavorite={() => toggleFavorite(name)}
              />
            ))
          )}
        </DropdownList>
      </SavedSearchesStateHandler>
    </Dropdown>
  );
};

export default SavedSearchesDropdown;
