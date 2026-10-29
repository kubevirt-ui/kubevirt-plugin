import type { FC, MouseEvent, ReactNode } from 'react';
import { useRef } from 'react';

import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { Menu, Popper } from '@patternfly/react-core';

import DropdownMenuToggle from './DropdownMenuToggle';
import type { DropdownConfig } from './types';

type DropdownToggleProps = {
  children: ReactNode;
  config: DropdownConfig;
  disabled?: boolean;
  isLoading?: boolean;
  isOpen: boolean;
  onActionClick: (event: MouseEvent, itemID: string) => void;
  onCloseMenu: () => void;
  onSelect: (event: MouseEvent, itemId: string) => void;
  onToggle: (isOpen: boolean) => void;
  selectedItem: string;
  title: string;
};

const DropdownToggle: FC<DropdownToggleProps> = ({
  children,
  config,
  disabled = false,
  isLoading = false,
  isOpen,
  onActionClick,
  onCloseMenu,
  onSelect,
  onToggle,
  selectedItem,
  title,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useClickOutside([menuRef, toggleRef], onCloseMenu);

  return (
    <div className={config.cssPrefix}>
      <DropdownMenuToggle
        config={config}
        disabled={disabled}
        isLoading={isLoading}
        isOpen={isOpen}
        onToggle={onToggle}
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
            {children}
          </Menu>
        }
        popperRef={menuRef}
        triggerRef={toggleRef}
      />
    </div>
  );
};

export default DropdownToggle;
