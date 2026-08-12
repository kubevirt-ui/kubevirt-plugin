import React, { FC, ReactNode } from 'react';

import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';

import ColumnManagement from '../../ColumnManagementModal/ColumnManagement';
import { TableToolbarActionsGroup } from '../../TableToolbarActions/TableToolbarActionsGroup';

type ToolbarActionsProps = {
  columnLayout?: ColumnLayout;
  hideColumnManagement?: boolean;
  toolbarEndContent?: ReactNode;
};

const ToolbarActions: FC<ToolbarActionsProps> = ({
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

export default ToolbarActions;
