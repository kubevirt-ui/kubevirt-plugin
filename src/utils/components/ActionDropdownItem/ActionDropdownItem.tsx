import React, { Dispatch, FC, SetStateAction, useMemo } from 'react';
import classNames from 'classnames';

import { Menu, MenuContent, MenuItem, MenuList, TooltipPosition } from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

import { ActionDropdownItemType } from '../ActionsDropdown/constants';

import './ActionDropdownItem.scss';

type ActionDropdownItemProps = {
  action: ActionDropdownItemType;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const ActionDropdownItem: FC<ActionDropdownItemProps> = ({ action, setIsOpen }) => {
  const [accessReview] = useFleetAccessReview(action?.accessReview || {});

  const { displayDisabledTooltip, isDisabled } = useMemo(() => {
    const allowed = !!accessReview || action?.accessReview === undefined;
    const disabled = !allowed || !!action?.disabled;
    const showTooltip = !!(disabled && action?.disabledTooltip);
    return {
      displayDisabledTooltip: showTooltip,
      isDisabled: disabled,
    };
  }, [accessReview, action?.accessReview, action?.disabled, action?.disabledTooltip]);

  const handleClick = (event?: React.MouseEvent) => {
    // Don't trigger action if clicking on a link in the description
    const target = event?.target;
    if (target && target instanceof HTMLElement && target.closest('a, [role="link"]')) {
      return;
    }
    if (!isDisabled && typeof action?.cta === 'function') {
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

  // If disabled but has description with link, don't disable the MenuItem
  // Instead, prevent the onClick handler from executing, but allow description clicks
  const hasDescriptionWithLink =
    isDisabled && action?.description && typeof action.description === 'object';
  const shouldDisableMenuItem = isDisabled && !hasDescriptionWithLink;

  return (
    <MenuItem
      className={classNames({
        'kv-action-dropdown-item--disabled-with-link': hasDescriptionWithLink,
        'pf-m-disabled': hasDescriptionWithLink,
      })}
      flyoutMenu={
        action?.options && (
          <Menu className="kv-actions-dropdown-submenu" containsFlyout id={`menu-${action.id}`}>
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
      isDisabled={shouldDisableMenuItem}
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
