import React, { FC, memo, useRef, useState } from 'react';

import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Menu, MenuContent, MenuList, Popper } from '@patternfly/react-core';

import ActionDropdownItem from '../ActionDropdownItem/ActionDropdownItem';

import { ActionDropdownItemType } from './constants';

type ActionsDropdownProps = {
  actions: ActionDropdownItemType[];
  className?: string;
  id?: string;
  isKebabToggle?: boolean;
  onLazyClick?: () => void;
};

const ActionsDropdown: FC<ActionsDropdownProps> = ({
  actions = [],
  isKebabToggle,
  onLazyClick,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onToggle = () => {
    setIsOpen((prevIsOpen) => {
      if (onLazyClick && !prevIsOpen) onLazyClick();

      return !prevIsOpen;
    });
  };

  const Toggle = isKebabToggle
    ? KebabToggle({ isExpanded: isOpen, onClick: onToggle })
    : DropdownToggle({
        children: t('Actions'),
        isExpanded: isOpen,
        onClick: onToggle,
      });

  const menu = (
    <Menu containsFlyout ref={menuRef}>
      <MenuContent>
        <MenuList>
          {actions?.map((action) => (
            <ActionDropdownItem action={action} key={action?.id} setIsOpen={setIsOpen} />
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <div className="kv-actions-dropdown" ref={containerRef}>
      {Toggle(toggleRef)}
      <Popper
        appendTo={containerRef.current}
        isVisible={isOpen}
        placement="bottom-end"
        popper={menu}
        triggerRef={toggleRef}
      />
    </div>
  );
};

export default memo(ActionsDropdown);
