import React, { FC, memo, ReactNode, Ref, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { MenuToggleElement } from '@patternfly/react-core';

import ActionDropdownItem from '../ActionDropdownItem/ActionDropdownItem';
import Dropdown from '../Dropdown/Dropdown';
import DropdownToggle from '../toggles/DropdownToggle';
import KebabToggle from '../toggles/KebabToggle';

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
  disabledTooltip,
  isDisabled,
  isKebabToggle,
  onLazyClick,
  variant,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useKubevirtTranslation();

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

  return (
    <Dropdown
      className="kv-actions-dropdown"
      disabledTooltip={disabledTooltip}
      isDisabled={isDisabled}
      isOpen={isOpen}
      popoverPlacement="bottom-end"
      setIsOpen={setIsOpen}
      toggle={(toggleRef: Ref<MenuToggleElement>) => Toggle(toggleRef)}
    >
      {actions?.map((action) => (
        <ActionDropdownItem action={action} key={action?.id} setIsOpen={setIsOpen} />
      ))}
    </Dropdown>
  );
};

export default memo(ActionsDropdown);
