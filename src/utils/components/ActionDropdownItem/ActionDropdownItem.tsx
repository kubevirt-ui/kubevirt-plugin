import React, { Dispatch, FC, SetStateAction } from 'react';

import {
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

import { ActionDropdownItemType } from '../ActionsDropdown/constants';

import './ActionDropdownItem.scss';

type ActionDropdownItemProps = {
  action: ActionDropdownItemType;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  tooltipPosition?: TooltipPosition;
  tooltipZIndex?: number;
};

const ActionDropdownItem: FC<ActionDropdownItemProps> = ({
  action,
  setIsOpen,
  tooltipPosition,
  tooltipZIndex,
}) => {
  const [accessReview] = useFleetAccessReview(action?.accessReview || {});

  const actionAllowed = accessReview || action?.accessReview === undefined;
  const isDisabled = !actionAllowed || action?.disabled;
  const showTooltip = isDisabled && action?.disabledTooltip;

  const handleClick = () => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  const menuItem = (
    <MenuItem
      flyoutMenu={
        action?.options && (
          <Menu className="kv-actions-dropdown-submenu" containsFlyout id={`menu-${action.id}`}>
            <MenuContent>
              <MenuList>
                {action?.options?.map((option) => (
                  <ActionDropdownItem
                    action={option}
                    key={option.id}
                    setIsOpen={setIsOpen}
                    tooltipPosition={tooltipPosition}
                    tooltipZIndex={tooltipZIndex}
                  />
                ))}
              </MenuList>
            </MenuContent>
          </Menu>
        )
      }
      data-test={`${action?.id}`}
      description={action?.description}
      isAriaDisabled={isDisabled}
      key={action?.id}
      onClick={handleClick}
    >
      {action?.label}
      {action?.icon && (
        <>
          {' '}
          <span className="pf-v6-u-text-color-subtle">{action.icon}</span>
        </>
      )}
    </MenuItem>
  );

  if (showTooltip) {
    return (
      <Tooltip
        content={action.disabledTooltip}
        position={tooltipPosition ?? TooltipPosition.left}
        {...(tooltipZIndex && { zIndex: tooltipZIndex })}
      >
        <div>{menuItem}</div>
      </Tooltip>
    );
  }

  return menuItem;
};

export default ActionDropdownItem;
