import { type FC, useCallback } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';
import isObject from 'lodash/isObject';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isCallable } from '@kubevirt-utils/utils/typeGuards';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import { type Action } from '@openshift-console/dynamic-plugin-sdk';
import { impersonateStateToProps } from '@openshift-console/dynamic-plugin-sdk/lib/app/core/reducers/coreSelectors';
import { type ImpersonateKind } from '@openshift-console/dynamic-plugin-sdk/lib/app/redux-types';
import { MenuItem, Tooltip } from '@patternfly/react-core';

import { type CheckAccess } from './LazyActionMenu';
import { useCheckAccess } from './overrides';

export type ActionMenuItemProps = {
  action: Action;
  autoFocus?: boolean;
  onClick?: () => void;
};

const ActionItem: FC<
  ActionMenuItemProps & { isAllowed: boolean; isPermissionDenied?: boolean }
> = ({ action, autoFocus, isAllowed, isPermissionDenied = false, onClick }) => {
  const { t } = useKubevirtTranslation();
  const { cta, description, disabled, icon, label } = action;
  const { external, href } = cta as { external?: boolean; href: string };
  const isDisabled = !isAllowed || disabled;
  const navigate = useNavigate();
  const tooltipContent = isPermissionDenied
    ? getNoPermissionTooltipContent(t)
    : action.disabledTooltip;

  const handleClick = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      if (isCallable(cta)) {
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
    'data-test': action.id,
    description,
    icon,
    isDisabled,
    onClick: handleClick,
    translate: 'no' as const,
    ...(external ? { isExternalLink: external, to: href } : {}),
  };

  const menuItem = <MenuItem {...props}>{label}</MenuItem>;

  if (isDisabled && tooltipContent && (isPermissionDenied || !action.tooltip)) {
    return (
      <Tooltip content={tooltipContent} position="left">
        <div>{menuItem}</div>
      </Tooltip>
    );
  }

  return menuItem;
};

const AccessReviewActionItem = connect(impersonateStateToProps)((
  props: ActionMenuItemProps & { checkAccess: CheckAccess; impersonate: ImpersonateKind },
) => {
  const { action, checkAccess, impersonate } = props;
  const [isAllowed, loading] = useCheckAccess(action.accessReview, impersonate, checkAccess);
  return (
    <ActionItem {...props} isAllowed={isAllowed} isPermissionDenied={!loading && !isAllowed} />
  );
});

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

  return item;
};

export default ActionMenuItem;
