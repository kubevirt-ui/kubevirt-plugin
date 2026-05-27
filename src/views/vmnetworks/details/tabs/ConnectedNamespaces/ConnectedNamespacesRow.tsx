import React, { FC } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import { NamespaceWithVMCount } from '../../types';

type ConnectedNamespacesRowProps = RowProps<NamespaceWithVMCount>;

const ConnectedNamespacesRow: FC<ConnectedNamespacesRowProps> = ({ activeColumnIDs, obj }) => {
  const { namespaceName, vmCount } = obj;

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
          key={namespaceName}
          name={namespaceName}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="connected-vms">
        {vmCount}
      </TableData>
    </>
  );
};

export default ConnectedNamespacesRow;
