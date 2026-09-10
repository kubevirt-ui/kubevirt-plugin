import type { FC } from 'react';
import React from 'react';

import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';

import type { BootableResource } from '../../utils/types';

type BootableVolumeArchitectureCellProps = {
  row: BootableResource;
};

const BootableVolumeArchitectureCell: FC<BootableVolumeArchitectureCellProps> = ({ row }) => (
  <ArchitectureLabel architecture={getArchitecture(row)} />
);

export default BootableVolumeArchitectureCell;
