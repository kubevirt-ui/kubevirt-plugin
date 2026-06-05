import React, { FC, ReactNode } from 'react';

import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';

import ColumnManagement from '../../ColumnManagementModal/ColumnManagement';
import { TableToolbarActionsGroup } from '../../TableToolbarActions/TableToolbarActionsGroup';

type ListPageFilterToolbarActionsProps = {
  columnLayout?: ColumnLayout;
  hideColumnManagement?: boolean;
  toolbarEndContent?: ReactNode;
};

const ListPageFilterToolbarActions: FC<ListPageFilterToolbarActionsProps> = ({
  columnLayout,
  hideColumnManagement,
  toolbarEndContent,
}) => (
  <TableToolbarActionsGroup>
    {toolbarEndContent}
    <ColumnManagement
      asToolbarItem
      columnLayout={columnLayout}
      hideColumnManagement={hideColumnManagement}
    />
  </TableToolbarActionsGroup>
);

export default ListPageFilterToolbarActions;
