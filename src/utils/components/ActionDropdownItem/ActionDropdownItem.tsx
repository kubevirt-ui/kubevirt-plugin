import React, { Dispatch, FC, SetStateAction } from 'react';

import { Action, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';

type ActionDropdownItemProps = {
  action: Action;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const ActionDropdownItem: FC<ActionDropdownItemProps> = ({ action, setIsOpen }) => {
  const [actionAllowed] = useAccessReview(action?.accessReview);

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
      onClick={handleClick}
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
