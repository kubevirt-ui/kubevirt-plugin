import { type JSX, useRef } from 'react';

import HidableTooltip from '@kubevirt-utils/components/HidableTooltip/HidableTooltip';

import DropdownMenuContent from './DropdownMenuContent';
import DropdownMenuFilterSection from './DropdownMenuFilterSection';
import DropdownMenuFooter from './DropdownMenuFooter';
import DropdownToggle from './DropdownToggle';
import type { DropdownConfig, DropdownProps } from './types';
import { useDropdownBookmarkActions } from './useDropdownBookmarkActions';
import { useDropdownMenuSelect } from './useDropdownMenuSelect';
import { useDropdownMenuState } from './useDropdownMenuState';

export type { DropdownConfig };

import './Dropdown.scss';

const Dropdown = <T,>(props: DropdownProps<T>): JSX.Element => {
  const {
    bookmarks,
    config,
    disabled = false,
    disabledTooltip,
    isLoading = false,
    onChange,
    selectedItem,
    showSystemToggle,
  } = props;
  const filterRef = useRef<HTMLInputElement>(null);
  const { closeMenu, filterText, isOpen, setFilterText, setIsOpen } = useDropdownMenuState();

  const { allItemsTitle, selectPlaceholder } = config;
  const title =
    selectedItem === config.allItemsKey ? allItemsTitle : selectedItem || selectPlaceholder;

  const { onSelect } = useDropdownMenuSelect({ onChange, setIsOpen });
  const { onActionClick } = useDropdownBookmarkActions({ bookmarks });

  return (
    <HidableTooltip content={disabledTooltip ?? ''} hidden={!disabled || !disabledTooltip}>
      <DropdownToggle
        config={config}
        disabled={disabled}
        isLoading={isLoading}
        isOpen={isOpen}
        onActionClick={onActionClick}
        onCloseMenu={closeMenu}
        onSelect={onSelect}
        onToggle={setIsOpen}
        selectedItem={selectedItem}
        title={title}
      >
        <DropdownMenuFilterSection
          config={config}
          filterRef={filterRef}
          filterText={filterText}
          onFilterChange={setFilterText}
          showSystemToggle={showSystemToggle}
        />
        <DropdownMenuContent dropdownProps={props} filterText={filterText} />
        <DropdownMenuFooter closeMenu={closeMenu} dropdownProps={props} filterText={filterText} />
      </DropdownToggle>
    </HidableTooltip>
  );
};

export default Dropdown;
