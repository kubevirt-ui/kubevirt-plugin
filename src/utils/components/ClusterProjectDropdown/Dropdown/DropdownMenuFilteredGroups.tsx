import type { ReactElement } from 'react';

import { MenuContent } from '@patternfly/react-core';

import DropdownGroup from './DropdownGroup';
import NoResults from './NoResults';
import type { DropdownOption, DropdownProps } from './types';
import { useFilteredOptions } from './useFilteredOptions';

type DropdownMenuFilteredGroupsProps<T> = {
  dropdownProps: DropdownProps<T>;
  filterText: string;
  optionItems: DropdownOption[];
};

function DropdownMenuFilteredGroups<T>({
  dropdownProps,
  filterText,
  optionItems,
}: Readonly<DropdownMenuFilteredGroupsProps<T>>): ReactElement {
  const { bookmarks, config, selectedItem, showSystemToggle } = dropdownProps;

  const { filteredFavorites, filteredOptions } = useFilteredOptions({
    bookmarks,
    filterText,
    optionItems,
    showSystemToggle,
  });

  const showEmptyState =
    filteredOptions.length === 0 && (!bookmarks.bookmarksLoaded || filteredFavorites.length === 0);

  return (
    <MenuContent className={`${config.cssPrefix}__menu-content`} maxMenuHeight="60vh">
      {showEmptyState ? <NoResults noItemsFoundTitle={config.noItemsFoundTitle} /> : null}
      {bookmarks.bookmarksLoaded && filteredFavorites.length > 0 && (
        <DropdownGroup
          config={config}
          favorites={bookmarks.bookmarks}
          isFavorites
          options={filteredFavorites}
          selectedKey={selectedItem}
          showBottomDivider={filteredOptions.length > 0}
        />
      )}
      <DropdownGroup
        config={config}
        favorites={bookmarks.bookmarks}
        options={filteredOptions}
        selectedKey={selectedItem}
      />
    </MenuContent>
  );
}

export default DropdownMenuFilteredGroups;
