import React, { FC } from 'react';
import classNames from 'classnames';

import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, SplitItem, Tooltip } from '@patternfly/react-core';
import { VMActionIconDetails } from '@virtualmachines/actions/components/VMActionsIconBar/utils/types';

import '../VMActionsIconBar.scss';

const ActionIconButton: FC<VMActionIconDetails> = ({
  action,
  Icon,
  iconClassname,
  isDisabled,
  isHidden,
}) => {
  const [actionAllowed] = useAccessReview(action?.accessReview);

  const handleClick = () => {
    if (typeof action?.cta === 'function') {
      action?.cta();
    }
  };

  return (
    !isHidden && (
      <SplitItem>
        <Tooltip content={action?.label}>
          <Button
            className="vm-actions-icon-bar__button"
            data-test-id={`${action?.id}-button`}
            isDisabled={!actionAllowed || isDisabled}
            onClick={handleClick}
            variant={ButtonVariant.link}
          >
            <Icon className={classNames(iconClassname, 'vm-actions-icon-bar__icon')} />
          </Button>
        </Tooltip>
      </SplitItem>
    )
  );
};

export default ActionIconButton;
