/* eslint-disable no-nested-ternary */
import * as React from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom-v5-compat';
import * as _ from 'lodash';

import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { impersonateStateToProps } from '@openshift-console/dynamic-plugin-sdk/lib/app/core/reducers/coreSelectors';
import { ImpersonateKind } from '@openshift-console/dynamic-plugin-sdk/lib/app/redux-types';
import { DropdownItemProps, KeyTypes, MenuItem, Tooltip } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

import { useAccessReview } from './overrides';

export type ActionMenuItemProps = {
  action: Action;
  autoFocus?: boolean;
  component?: React.ComponentType<DropdownItemProps>;
  onClick?: () => void;
  onEscape?: () => void;
};

const ActionItem: React.FC<ActionMenuItemProps & { isAllowed: boolean }> = ({
  action,
  autoFocus,
  component,
  isAllowed,
  onClick,
  onEscape,
}) => {
  const { cta, description, disabled, icon, label } = action;
  const { external, href } = cta as { external?: boolean; href: string };
  const isDisabled = !isAllowed || disabled;
  const classes = css({ 'pf-m-disabled': isDisabled });
  const navigate = useNavigate();

  const handleClick = React.useCallback(
    (event) => {
      event.preventDefault();
      if (_.isFunction(cta)) {
        cta();
      } else if (_.isObject(cta)) {
        if (!cta.external) {
          navigate(cta.href);
        }
      }
      onClick && onClick();
      event.stopPropagation();
    },
    [cta, onClick, navigate],
  );

  const handleKeyDown = (event) => {
    if (event.keyCode === KeyTypes.Escape) {
      onEscape && onEscape();
    }

    if (event.keyCode === KeyTypes.Enter) {
      handleClick(event);
    }
  };
  const Component = component ?? MenuItem;

  const props = {
    autoFocus,
    className: classes,
    'data-test-action': label,
    description,
    icon,
    isDisabled,
    onClick: handleClick,
    translate: 'no' as const,
  };

  const extraProps = {
    onKeyDown: handleKeyDown,
    ...(external ? { isExternalLink: external, to: href } : {}),
  };

  return (
    <Component {...props} {...(component ? {} : extraProps)}>
      {label}
    </Component>
  );
};

const AccessReviewActionItem = connect(impersonateStateToProps)(
  (props: ActionMenuItemProps & { impersonate: ImpersonateKind; isMulticluster: boolean }) => {
    const { action, impersonate, isMulticluster } = props;
    const isAllowed = useAccessReview(isMulticluster, action.accessReview, impersonate);
    return <ActionItem {...props} isAllowed={isAllowed} />;
  },
);

const ActionMenuItem: React.FC<ActionMenuItemProps & { isMulticluster: boolean }> = (props) => {
  const { action } = props;
  let item;

  if (action.accessReview) {
    item = <AccessReviewActionItem {...props} />;
  } else {
    item = <ActionItem {...props} isAllowed />;
  }

  return action.tooltip ? (
    <Tooltip content={action.tooltip} position="left">
      {item}
    </Tooltip>
  ) : action.disabled && action.disabledTooltip ? (
    <Tooltip content={action.disabledTooltip} position="left">
      <div>{item}</div>
    </Tooltip>
  ) : (
    item
  );
};

export default ActionMenuItem;
