import React, { FC, memo, ReactNode, useRef, useState } from 'react';
import classNames from 'classnames';

import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Menu, MenuContent, MenuList, Popper, Tooltip } from '@patternfly/react-core';

import ActionDropdownItem from '../ActionDropdownItem/ActionDropdownItem';

import { ActionDropdownItemType } from './constants';

type ActionsDropdownProps = {
  actions: ActionDropdownItemType[];
  className?: string;
  disabledTooltip?: ReactNode;
  id?: string;
  isDisabled?: boolean;
  isKebabToggle?: boolean;
  onLazyClick?: () => void;
  variant?: 'default' | 'plain' | 'plainText' | 'primary' | 'secondary' | 'typeahead';
};

const ActionsDropdown: FC<ActionsDropdownProps> = ({
  actions = [],
  className,
  disabledTooltip,
  isDisabled,
  isKebabToggle,
  onLazyClick,
  variant,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside([menuRef, toggleRef], () => setIsOpen(false));

  const onToggle = () => {
    setIsOpen((prevIsOpen) => {
      if (onLazyClick && !prevIsOpen) onLazyClick();

      return !prevIsOpen;
    });
  };

  const Toggle = isKebabToggle
    ? KebabToggle({ isDisabled, isExpanded: isOpen, onClick: onToggle })
    : DropdownToggle({
        children: t('Actions'),
        isDisabled,
        isExpanded: isOpen,
        onClick: onToggle,
        variant,
      });

  if (isDisabled)
    return (
      <div className={classNames('kv-actions-dropdown', className)} ref={containerRef}>
        {disabledTooltip ? (
          <Tooltip content={disabledTooltip}>
            <span>{Toggle(toggleRef)}</span>
          </Tooltip>
        ) : (
          <span>{Toggle(toggleRef)}</span>
        )}
      </div>
    );

  return (
    <div
      className={classNames('kv-actions-dropdown', className)}
      data-test="actions-dropdown"
      ref={containerRef}
    >
      {Toggle(toggleRef)}
      <Popper
        popper={
          <Menu containsFlyout ref={menuRef}>
            <MenuContent>
              <MenuList style={{ minWidth: 'max-content' }}>
                {actions?.map((action) => (
                  <ActionDropdownItem action={action} key={action?.id} setIsOpen={setIsOpen} />
                ))}
              </MenuList>
            </MenuContent>
          </Menu>
        }
        isVisible={isOpen}
        placement="bottom-end"
        triggerRef={toggleRef}
      />
    </div>
  );
};

export default memo(ActionsDropdown);
