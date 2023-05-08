import React, { FC, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';

import { KEY_CODES, MenuItem } from '@patternfly/react-core';

import { ActionMenuItemProps } from '../ActionMenuItem';

const ActionItem: FC<ActionMenuItemProps & { isAllowed: boolean }> = ({
  action,
  onClick,
  onEscape,
  autoFocus,
  isAllowed,
  component,
}) => {
  const history = useHistory();
  const { label, icon, disabled, cta } = action;
  const { href, external } = cta as { href: string; external?: boolean };
  const isDisabled = !isAllowed || disabled;
  const classes = classNames({ 'pf-m-disabled': isDisabled });

  const handleClick = useCallback(
    (event) => {
      event.preventDefault();
      if (typeof cta === 'function') {
        cta();
      } else if (cta instanceof Object) {
        if (!cta?.external) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          history.push(cta?.href);
        }
      }
      onClick && onClick();
      event.stopPropagation();
    },
    [cta, onClick],
  );

  const handleKeyDown = (event) => {
    if (event.keyCode === KEY_CODES.ESCAPE_KEY) {
      onEscape && onEscape();
    }

    if (event.keyCode === KEY_CODES.ENTER) {
      handleClick(event);
    }
  };
  const Component = component ?? MenuItem;

  const props = {
    icon,
    autoFocus,
    isDisabled,
    className: classes,
    onClick: handleClick,
    'data-test-action': label,
    translate: 'no',
  };

  const extraProps = {
    onKeyDown: handleKeyDown,
    ...(external ? { to: href, isExternalLink: external } : {}),
  };

  return (
    <Component {...props} {...(component ? {} : extraProps)}>
      {label}
    </Component>
  );
};

export default ActionItem;
