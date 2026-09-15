import { type FC, type JSX, useMemo, useState } from 'react';

import {
  type KubevirtFilterState,
  type OnSetFilters,
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
import { type SavedSearchEntry } from '@search/savedSearches/types';
import { applySearch } from '@search/savedSearches/utils';

import SavedSearchesStateHandler from './components/SavedSearchesStateHandler';
import SavedSearchItem from './components/SavedSearchItem';
import useDeleteSavedSearch from './hooks/useDeleteSavedSearch';
import { getSavedSearchesItemsToDisplay, getSortedSavedsearches } from './utils/utils';

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

  const { favoriteSavedSearchesItems, otherSavedSearchesItems, shouldDisplayDivider } =
    useMemo(() => {
      const sorted = getSortedSavedsearches(searches, filterText);
      return getSavedSearchesItemsToDisplay(sorted);
    }, [searches, filterText]);

  const savedSearchesItemsToDropdownItems = (
    savedSearchesItems: SavedSearchEntry[],
  ): JSX.Element[] =>
    savedSearchesItems.map(({ description, isFavorited, name }) => (
      <SavedSearchItem
        description={description}
        isFavorited={isFavorited}
        key={name}
        name={name}
        onApply={() => {
          applySearch(name, searches, filters, onSetFilters);
          setOpen(false);
        }}
        onDelete={() => handleDelete(name, isFavorited)}
        onToggleFavorite={() => toggleFavorite(name)}
      />
    ));

  return (
    <Dropdown
      isOpen={open}
      isScrollable
      onOpenChange={(isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
          setFilterText('');
        }
      }}
      popperProps={{ position: 'end' }}
      toggle={(toggleRef) => (
        <MenuToggle isExpanded={open} onClick={() => setOpen(!open)} ref={toggleRef}>
          {t('Saved searches')}
        </MenuToggle>
      )}
    >
      <SavedSearchesStateHandler
        loaded={searchesInitiallyLoaded}
        loadError={searchesLoadError}
        searches={searches}
      >
        <MenuSearch>
          <MenuSearchInput>
            <SearchInput
              onChange={(_event, value) => setFilterText(value)}
              placeholder={t('Find by name')}
              value={filterText}
            />
          </MenuSearchInput>
        </MenuSearch>
        <Divider />
        <DropdownList className="saved-searches-dropdown-menu" data-test="saved-searches">
          {isEmpty(favoriteSavedSearchesItems) && isEmpty(otherSavedSearchesItems) ? (
            <DropdownItem isDisabled key="no-results">
              {t('No saved searches match "{{filterText}}".', { filterText })}
            </DropdownItem>
          ) : (
            <>
              {savedSearchesItemsToDropdownItems(favoriteSavedSearchesItems)}
              {shouldDisplayDivider && <Divider component="li" />}
              {savedSearchesItemsToDropdownItems(otherSavedSearchesItems)}
            </>
          )}
        </DropdownList>
      </SavedSearchesStateHandler>
    </Dropdown>
  );
};

export default SavedSearchesDropdown;
