import React, { Dispatch, FC, SetStateAction } from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePermissions from '@kubevirt-utils/hooks/usePermissions/usePermissions';
import { Action, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem, TooltipPosition } from '@patternfly/react-core';

import './action-dropdown-item.scss';

type ActionDropdownItemProps = {
  action: Action;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const ActionDropdownItem: FC<ActionDropdownItemProps> = ({ action, setIsOpen }) => {
  const { t } = useKubevirtTranslation();
  const [actionAllowed] = useAccessReview(action?.accessReview);
  const { capabilitiesData } = usePermissions();
  const isCloneDisabled = !capabilitiesData?.['clone']?.allowed && action?.id === 'vm-action-clone';

  const handleClick = () => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  return (
    <DropdownItem
      data-test-id={`${action?.id}`}
      description={action?.description}
      isDisabled={action?.disabled || !actionAllowed}
      key={action?.id}
      onClick={!isCloneDisabled && handleClick}
      {...(isCloneDisabled && {
        tooltip: t(`You don't have permission to perform this action`),
        tooltipProps: { position: TooltipPosition.left },
      })}
      className={classNames({ ActionDropdownItem__disabled: isCloneDisabled })}
    >
      {action?.label}
      {action?.icon && (
        <>
          {' '}
          <span className="text-muted">{action.icon}</span>
        </>
      )}
    </DropdownItem>
  );
};

export default ActionDropdownItem;
