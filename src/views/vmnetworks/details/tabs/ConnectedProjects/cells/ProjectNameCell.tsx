import React, { FC } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { useProjectOrNamespaceModel } from '@kubevirt-utils/hooks/useProjectOrNamespaceModel';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { ProjectWithVMCount } from '../../../types';

type ProjectNameCellProps = {
  row: ProjectWithVMCount;
};

const ProjectNameCell: FC<ProjectNameCellProps> = ({ row }) => {
  const model = useProjectOrNamespaceModel();
  const { projectName } = row;

  if (!projectName) {
    return <span data-test="project-name">{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`project-name-${projectName}`}>
      <ResourceLink groupVersionKind={modelToGroupVersionKind(model)} name={projectName} />
    </span>
  );
};

export default ProjectNameCell;
