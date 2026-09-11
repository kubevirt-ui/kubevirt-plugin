import type { FC } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import type { RowProps } from '@openshift-console/dynamic-plugin-sdk';
import { ResourceLink, TableData } from '@openshift-console/dynamic-plugin-sdk';

import type { ProjectWithVMCount } from '../../types';

type ConnectedProjectsRowProps = RowProps<ProjectWithVMCount>;

const ConnectedProjectsRow: FC<ConnectedProjectsRowProps> = ({ activeColumnIDs, obj }) => {
  const { projectName, vmCount } = obj;

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(ProjectModel)}
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
