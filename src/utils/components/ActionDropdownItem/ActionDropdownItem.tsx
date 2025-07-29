import React, { Dispatch, FC, SetStateAction } from 'react';

import { Menu, MenuContent, MenuItem, MenuList, TooltipPosition } from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

import { ActionDropdownItemType } from '../ActionsDropdown/constants';

type ActionDropdownItemProps = {
  action: ActionDropdownItemType;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const ActionDropdownItem: FC<ActionDropdownItemProps> = ({ action, setIsOpen }) => {
  const [accessReview] = useFleetAccessReview(action?.accessReview || {});

  const actionAllowed = accessReview || action?.accessReview === undefined;
  const isDisabled = !actionAllowed || action?.disabled;
  const displayDisabledTooltip = isDisabled && action?.disabledTooltip;

  const handleClick = () => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  const tooltipProps = displayDisabledTooltip
    ? {
        content: action?.disabledTooltip,
        position: TooltipPosition.left,
      }
    : null;

  return (
    <MenuItem
      flyoutMenu={
        action?.options && (
          <Menu containsFlyout id={`menu-${action.id}`}>
            <MenuContent>
              <MenuList>
                {action?.options?.map((option) => (
                  <ActionDropdownItem action={option} key={option.id} setIsOpen={setIsOpen} />
                ))}
              </MenuList>
            </MenuContent>
          </Menu>
        )
      }
      data-test-id={`${action?.id}`}
      description={action?.description}
      isDisabled={isDisabled}
      key={action?.id}
      onClick={handleClick}
      tooltipProps={tooltipProps}
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
};

export default ActionDropdownItem;
