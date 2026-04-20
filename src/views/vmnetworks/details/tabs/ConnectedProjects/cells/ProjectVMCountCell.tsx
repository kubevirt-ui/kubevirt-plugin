import React, { FCC } from 'react';

import { ProjectWithVMCount } from '../../../types';

type ProjectVMCountCellProps = {
  row: ProjectWithVMCount;
};

const ProjectVMCountCell: FCC<ProjectVMCountCellProps> = ({ row }) => {
  const { projectName, vmCount } = row;

  return <span data-test={`project-vmcount-${projectName ?? 'unknown'}`}>{vmCount}</span>;
};

export default ProjectVMCountCell;
