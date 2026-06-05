import React, { FC } from 'react';
import classNames from 'classnames';

import { Flex } from '@patternfly/react-core';

import { TableToolbarActionsProps } from './types';

import './TableToolbarActions.scss';

/**
 * Groups table toolbar icon actions in a flex row (e.g. beside pagination).
 * @param root0
 * @param root0.children
 * @param root0.className
 */
export const TableToolbarActionsFlex: FC<TableToolbarActionsProps> = ({ children, className }) => (
  <Flex
    alignItems={{ default: 'alignItemsCenter' }}
    className={classNames('kubevirt-table-toolbar-actions', className)}
    flexWrap={{ default: 'nowrap' }}
  >
    {children}
  </Flex>
);
