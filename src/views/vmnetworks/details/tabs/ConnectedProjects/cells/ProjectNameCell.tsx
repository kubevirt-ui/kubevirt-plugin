import React, { FCC } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { ProjectWithVMCount } from '../../../types';

type ProjectNameCellProps = {
  row: ProjectWithVMCount;
};

const ProjectNameCell: FCC<ProjectNameCellProps> = ({ row }) => {
  const { projectName } = row;

  if (!projectName) {
    return <span data-test="project-name">{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`project-name-${projectName}`}>
      <ResourceLink groupVersionKind={modelToGroupVersionKind(ProjectModel)} name={projectName} />
    </span>
  );
};

export default ProjectNameCell;
