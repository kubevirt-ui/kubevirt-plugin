import React, { type FC } from 'react';
import classNames from 'classnames';

import { Button, ButtonVariant, SplitItem, Tooltip } from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { type VMActionIconDetails } from '@virtualmachines/actions/components/VMActionsIconBar/utils/types';

import '../VMActionsIconBar.scss';

const ActionIconButton: FC<VMActionIconDetails> = ({
  action,
  icon: iconComponent,
  iconClassname,
  isDisabled,
  isHidden,
}) => {
  const [actionAllowed] = useFleetAccessReview(action?.accessReview);
  const IconElement = iconComponent;

  const handleClick = (): void => {
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
            data-test={`${action?.id}-button`}
            isDisabled={!actionAllowed || isDisabled}
            onClick={handleClick}
            variant={ButtonVariant.link}
          >
            <IconElement className={classNames(iconClassname, 'vm-actions-icon-bar__icon')} />
          </Button>
        </Tooltip>
      </SplitItem>
    )
  );
};

export default ActionIconButton;
