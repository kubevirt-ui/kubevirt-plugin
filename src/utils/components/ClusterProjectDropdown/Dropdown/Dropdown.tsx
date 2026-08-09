import React, { useRef, useState } from 'react';

import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { Menu, MenuContent, Popper, Tooltip } from '@patternfly/react-core';

import DropdownGroup from './DropdownGroup';
import DropdownMenuToggle from './DropdownMenuToggle';
import Filter from './Filter';
import NoResults from './NoResults';
import ShowSystemNamespacesSwitch from './ShowSystemNamespacesSwitch';
import type { DropdownConfig, DropdownProps } from './types';
export type { DropdownConfig };
import { useDropdownCallbacks } from './useDropdownCallbacks';
import { useDropdownOptions } from './useDropdownOptions';
import { useFilteredOptions } from './useFilteredOptions';

import './Dropdown.scss';

const Dropdown = <T,>({
  bookmarks,
  config,
  disabled = false,
  disabledItemTooltip,
  disabledTooltip,
  extractKey,
  extractTitle,
  includeAllItems = true,
  isItemDisabled,
  items,
  itemsLoaded,
  omittedItems,
  onChange,
  selectedItem,
  showSystemToggle,
}: DropdownProps<T>): React.JSX.Element => {
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

  const optionItems = useDropdownOptions({
    config,
    disabledItemTooltip,
    extractKey,
    extractTitle,
    includeAllItems,
    isItemDisabled,
    items,
    itemsLoaded,
    omittedItems,
    onChange,
    selectedItem,
  });

  const { filteredFavorites, filteredOptions } = useFilteredOptions({
    bookmarks,
    filterText,
    optionItems,
    showSystemToggle,
  });

  const { onActionClick, onClearFilters, onSelect } = useDropdownCallbacks({
    bookmarks,
    filterRef,
    onChange,
    setFilterText,
    setIsOpen,
    showSystemToggle,
  });

  const dropdown = (
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
        isVisible={isOpen}
        placement="bottom-start"
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
            {showSystemToggle && (
              <div role="none">
                <ShowSystemNamespacesSwitch
                  cssPrefix={config.cssPrefix}
                  hasSystemNamespaces={showSystemToggle.hasSystemItems}
                  isChecked={showSystemToggle.show}
                  onChange={showSystemToggle.onChange}
                />
              </div>
            )}
            <MenuContent className={`${config.cssPrefix}__menu-content`} maxMenuHeight="60vh">
              {filteredOptions.length === 0 &&
              (!bookmarks.bookmarksLoaded || filteredFavorites.length === 0) ? (
                <NoResults noItemsFoundTitle={config.noItemsFoundTitle} onClear={onClearFilters} />
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
        triggerRef={toggleRef}
      />
    </div>
  );

  return disabled && disabledTooltip ? (
    <Tooltip content={disabledTooltip}>{dropdown}</Tooltip>
  ) : (
    dropdown
  );
};

export default Dropdown;
