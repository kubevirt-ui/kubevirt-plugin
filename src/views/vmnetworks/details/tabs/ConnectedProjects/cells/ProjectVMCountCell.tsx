import React, { FC } from 'react';

import { ProjectWithVMCount } from '../../../types';

type ProjectVMCountCellProps = {
  row: ProjectWithVMCount;
};

const ProjectVMCountCell: FC<ProjectVMCountCellProps> = ({ row }) => {
  const { projectName, vmCount } = row;

  return <span data-test={`project-vmcount-${projectName ?? 'unknown'}`}>{vmCount}</span>;
};

export default ProjectVMCountCell;
