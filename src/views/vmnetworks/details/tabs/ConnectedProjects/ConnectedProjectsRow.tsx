import React, { FC } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { useProjectOrNamespaceModel } from '@kubevirt-utils/hooks/useProjectOrNamespaceModel';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import { ProjectWithVMCount } from '../../types';

type ConnectedProjectsRowProps = RowProps<ProjectWithVMCount>;

const ConnectedProjectsRow: FC<ConnectedProjectsRowProps> = ({ activeColumnIDs, obj }) => {
  const model = useProjectOrNamespaceModel();
  const { projectName, vmCount } = obj;

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(model)}
          key={projectName}
          name={projectName}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="connected-vms">
        {vmCount}
      </TableData>
    </>
  );
};

export default ConnectedProjectsRow;
