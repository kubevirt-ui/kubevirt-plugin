import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import fuzzysearch from 'fuzzysearch';

import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { Menu, MenuContent, Popper } from '@patternfly/react-core';

import DropdownGroup from './DropdownGroup';
import DropdownMenuToggle from './DropdownMenuToggle';
import Filter from './Filter';
import NoResults from './NoResults';
import type { DropdownBookmarks, DropdownConfig, DropdownOption } from './types';
export type { DropdownConfig };
import './Dropdown.scss';

type DropdownBookmarksProps = {
  bookmarks: DropdownBookmarks;
};

type DropdownDataFetchingProps<T> = {
  extractKey: (item: T) => string;
  extractTitle: (item: T) => string;
  items: null | T[] | undefined;
  itemsLoaded: boolean;
};

type DropdownProps<T> = DropdownBookmarksProps &
  DropdownDataFetchingProps<T> & {
    config: DropdownConfig;
    disabled?: boolean;
    includeAllItems?: boolean;
    onChange: (item: string) => void;
    selectedItem: string;
  };

const Dropdown = <T,>({
  bookmarks,
  config,
  disabled = false,
  extractKey,
  extractTitle,
  includeAllItems = true,
  items,
  itemsLoaded,
  onChange,
  selectedItem,
}: DropdownProps<T>): JSX.Element => {
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  useClickOutside([menuRef, toggleRef], () => {
    setIsOpen(false);
    setFilterText('');
  });

  const { allItemsTitle } = config;
  const title = selectedItem === config.allItemsKey ? allItemsTitle : selectedItem;

  const optionItems = useMemo(() => {
    if (!items || !itemsLoaded) return [];

    const mappedItems = items.map((item) => ({
      key: extractKey(item),
      title: extractTitle(item),
    }));

    mappedItems.sort((a, b) => a.title.localeCompare(b.title));

    if (includeAllItems) {
      mappedItems.unshift({ key: config.allItemsKey, title: allItemsTitle });
    }

    return mappedItems;
  }, [
    items,
    itemsLoaded,
    includeAllItems,
    allItemsTitle,
    config.allItemsKey,
    extractKey,
    extractTitle,
  ]);

  // Revert to first item if selected item is not in the list
  useEffect(() => {
    if (!itemsLoaded || !optionItems.length) return;

    if (selectedItem && !optionItems.some((item) => item.key === selectedItem)) {
      // Revert to the first item in the list
      const firstItem = optionItems[0]?.key;
      if (firstItem) {
        onChange(firstItem);
      }
    }
  }, [itemsLoaded, optionItems, selectedItem]); // eslint-disable-line react-hooks/exhaustive-deps

  const { filteredFavorites, filteredOptions } = useMemo(() => {
    const favorites: DropdownOption[] = [];
    const regular: DropdownOption[] = [];

    optionItems.forEach((option) => {
      const isFav = !!bookmarks.bookmarks?.[option.key];
      const matchesFilter = fuzzysearch(filterText.toLowerCase(), option.title.toLowerCase());

      if (!matchesFilter) return;

      if (isFav) {
        favorites.push(option);
      } else {
        regular.push(option);
      }
    });

    return { filteredFavorites: favorites, filteredOptions: regular };
  }, [optionItems, filterText, bookmarks.bookmarks]);

  const onSetFavorite = useCallback(
    async (key: string, active: boolean) => {
      if (!bookmarks.bookmarksLoaded || !bookmarks.updateBookmarks) return;

      const newBookmarks = { ...bookmarks.bookmarks };
      if (active) {
        newBookmarks[key] = true;
      } else {
        delete newBookmarks[key];
      }

      try {
        await bookmarks.updateBookmarks(newBookmarks);
      } catch (error) {
        // Error handling is done in the hook
      }
    },
    [bookmarks],
  );

  const onSelect = useCallback(
    (_event: React.MouseEvent, itemId: string) => {
      setIsOpen(false);
      onChange(itemId);
    },
    [onChange],
  );

  const onActionClick = useCallback(
    (event: React.MouseEvent, itemID: string) => {
      event.preventDefault();
      event.stopPropagation();
      const isCurrentFavorite = bookmarks.bookmarks?.[itemID];
      onSetFavorite(itemID, !isCurrentFavorite);
    },
    [bookmarks.bookmarks, onSetFavorite],
  );

  return (
    <div className={config.cssPrefix}>
      <DropdownMenuToggle
        config={config}
        disabled={disabled}
        isOpen={isOpen}
        onToggle={setIsOpen}
        title={title}
        toggleRef={toggleRef}
      />
      <Popper
        popper={
          <Menu
            activeItemId={selectedItem}
            className={`${config.cssPrefix}__menu`}
            containsFlyout
            data-test={config.dataTestId}
            onActionClick={onActionClick}
            onSelect={onSelect}
            ref={menuRef}
          >
            <div className={`${config.cssPrefix}__search-wrapper`}>
              <Filter
                config={config}
                filterRef={filterRef}
                filterText={filterText}
                onFilterChange={setFilterText}
              />
            </div>
            <MenuContent className={`${config.cssPrefix}__menu-content`} maxMenuHeight="60vh">
              {filteredOptions.length === 0 &&
              (!bookmarks.bookmarksLoaded || filteredFavorites.length === 0) ? (
                <NoResults noItemsFoundTitle={config.noItemsFoundTitle} />
              ) : null}
              {bookmarks.bookmarksLoaded && filteredFavorites.length > 0 && (
                <DropdownGroup
                  config={config}
                  favorites={bookmarks.bookmarks}
                  isFavorites
                  options={filteredFavorites}
                  selectedKey={selectedItem}
                />
              )}
              <DropdownGroup
                config={config}
                favorites={bookmarks.bookmarks}
                options={filteredOptions}
                selectedKey={selectedItem}
              />
            </MenuContent>
          </Menu>
        }
        isVisible={isOpen}
        placement="bottom-start"
        triggerRef={toggleRef}
      />
    </div>
  );
};

export default Dropdown;
