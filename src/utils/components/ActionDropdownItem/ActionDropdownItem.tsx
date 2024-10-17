import React, { Dispatch, FC, SetStateAction } from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Menu, MenuContent, MenuItem, MenuList, TooltipPosition } from '@patternfly/react-core';

import { ActionDropdownItemType } from '../ActionsDropdown/constants';

import './action-dropdown-item.scss';

type ActionDropdownItemProps = {
  action: ActionDropdownItemType;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const ActionDropdownItem: FC<ActionDropdownItemProps> = ({ action, setIsOpen }) => {
  const { t } = useKubevirtTranslation();
  const [actionAllowed] = useAccessReview(action?.accessReview || {});
  const isCloneDisabled = !actionAllowed && action?.id === 'vm-action-clone';

  const handleClick = () => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  return (
    <MenuItem
      data-test-id={`${action?.id}`}
      description={action?.description}
      isDisabled={action?.disabled || !actionAllowed}
      key={action?.id}
      onClick={handleClick}
      {...(isCloneDisabled && {
        tooltipProps: {
          content: t(`You don't have permission to perform this action`),
          position: TooltipPosition.left,
        },
      })}
      className={classNames('ActionDropdownItem', {
        ActionDropdownItem__disabled: isCloneDisabled,
      })}
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
    >
      {action?.label}
      {action?.icon && (
        <>
          {' '}
          <span className="text-muted">{action.icon}</span>
        </>
      )}
    </MenuItem>
  );
};

export default ActionDropdownItem;
