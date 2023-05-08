import React, { FC } from 'react';

import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItemProps, MenuItemProps, Tooltip } from '@patternfly/react-core';

import AccessReviewActionItem from './components/AccessReviewActionItem';
import ActionItem from './components/ActionItem';

export type ActionMenuItemProps = {
  action: Action;
  component?: React.ComponentType<MenuItemProps | DropdownItemProps>;
  autoFocus?: boolean;
  onClick?: () => void;
  onEscape?: () => void;
};

const ActionMenuItem: FC<ActionMenuItemProps> = (props) => {
  const { action } = props;
  let item;

  if (action.accessReview) {
    item = <AccessReviewActionItem {...props} />;
  } else {
    item = <ActionItem {...props} isAllowed />;
  }

  if (action?.tooltip) {
    return (
      <Tooltip position="left" content={action.tooltip}>
        {item}
      </Tooltip>
    );
  }

  if (action?.disabled && action?.disabledTooltip) {
    return (
      <Tooltip position="left" content={action.disabledTooltip}>
        <div>{item}</div>
      </Tooltip>
    );
  }

  return item;
};

export default ActionMenuItem;
