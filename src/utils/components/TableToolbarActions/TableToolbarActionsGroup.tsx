import React, { FC } from 'react';
import classNames from 'classnames';

import { ToolbarGroup } from '@patternfly/react-core';

import { TableToolbarActionsProps } from './types';

import './TableToolbarActions.scss';

/**
 * Groups table toolbar icon actions inside a PatternFly Toolbar (export, column management).
 * @param root0
 * @param root0.children
 * @param root0.className
 */
export const TableToolbarActionsGroup: FC<TableToolbarActionsProps> = ({ children, className }) => (
  <ToolbarGroup
    align={{ default: 'alignEnd' }}
    className={classNames('kubevirt-table-toolbar-actions', className)}
    variant="action-group"
  >
    {children}
  </ToolbarGroup>
);
