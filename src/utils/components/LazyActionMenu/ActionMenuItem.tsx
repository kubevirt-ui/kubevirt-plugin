import React, { FC, useCallback } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom-v5-compat';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';

import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { impersonateStateToProps } from '@openshift-console/dynamic-plugin-sdk/lib/app/core/reducers/coreSelectors';
import { ImpersonateKind } from '@openshift-console/dynamic-plugin-sdk/lib/app/redux-types';
import { MenuItem, Tooltip } from '@patternfly/react-core';

import { CheckAccess } from './LazyActionMenu';
import { useCheckAccess } from './overrides';

export type ActionMenuItemProps = {
  action: Action;
  autoFocus?: boolean;
  onClick?: () => void;
};

const ActionItem: FC<ActionMenuItemProps & { isAllowed: boolean }> = ({
  action,
  autoFocus,
  isAllowed,
  onClick,
}) => {
  const { cta, description, disabled, icon, label } = action;
  const { external, href } = cta as { external?: boolean; href: string };
  const isDisabled = !isAllowed || disabled;
  const navigate = useNavigate();

  const handleClick = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      if (isFunction(cta)) {
        cta();
      } else if (isObject(cta) && !cta.external) {
        navigate(cta.href);
      }
      onClick?.();
      event.stopPropagation();
    },
    [cta, onClick, navigate],
  );

  const props = {
    autoFocus,
    'data-test-action': label,
    description,
    icon,
    isDisabled,
    onClick: handleClick,
    translate: 'no' as const,
    ...(external ? { isExternalLink: external, to: href } : {}),
  };

  return <MenuItem {...props}>{label}</MenuItem>;
};

const AccessReviewActionItem = connect(impersonateStateToProps)(
  (props: ActionMenuItemProps & { checkAccess: CheckAccess; impersonate: ImpersonateKind }) => {
    const { action, checkAccess, impersonate } = props;
    const [isAllowed] = useCheckAccess(action.accessReview, impersonate, checkAccess);
    return <ActionItem {...props} isAllowed={isAllowed} />;
  },
);

const ActionMenuItem: FC<ActionMenuItemProps & { checkAccess: CheckAccess }> = (props) => {
  const { action } = props;
  const item = action.accessReview ? (
    <AccessReviewActionItem {...props} />
  ) : (
    <ActionItem {...props} isAllowed />
  );

  if (action.tooltip) {
    return (
      <Tooltip content={action.tooltip} position="left">
        {item}
      </Tooltip>
    );
  }

  return action.disabled && action.disabledTooltip ? (
    <Tooltip content={action.disabledTooltip} position="left">
      <div>{item}</div>
    </Tooltip>
  ) : (
    item
  );
};

export default ActionMenuItem;
