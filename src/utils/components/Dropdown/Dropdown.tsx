import React, { FC, ReactNode, Ref, useRef } from 'react';

import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import {
  Menu,
  MenuContent,
  MenuList,
  MenuToggleElement,
  Popper,
  Tooltip,
} from '@patternfly/react-core';
import { Placement } from '@patternfly/react-core/dist/esm/helpers/Popper/thirdparty/popper-core';

type DropdownProps = {
  className?: string;
  disabledTooltip?: ReactNode;
  id?: string;
  isDisabled?: boolean;
  isOpen: boolean;
  popoverPlacement?: Placement;
  setIsOpen: (newState: boolean) => void;
  toggle: (toggleRef: Ref<MenuToggleElement>) => React.JSX.Element;
};

const Dropdown: FC<DropdownProps> = ({
  children,
  className,
  disabledTooltip,
  isDisabled,
  isOpen,
  popoverPlacement,
  setIsOpen,
  toggle,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside([menuRef, toggleRef], () => setIsOpen(false));

  if (isDisabled)
    return (
      <div className={className} ref={containerRef}>
        <Tooltip content={disabledTooltip}>
          <span> {toggle(toggleRef)}</span>
        </Tooltip>
      </div>
    );

  return (
    <div className={className} ref={containerRef}>
      {toggle(toggleRef)}
      <Popper
        popper={
          <Menu containsFlyout ref={menuRef}>
            <MenuContent>
              <MenuList>{children}</MenuList>
            </MenuContent>
          </Menu>
        }
        appendTo={containerRef.current}
        isVisible={isOpen}
        placement={popoverPlacement}
        triggerRef={toggleRef}
      />
    </div>
  );
};

export default Dropdown;
