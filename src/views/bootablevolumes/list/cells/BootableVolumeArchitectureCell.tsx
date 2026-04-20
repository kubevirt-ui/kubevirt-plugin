import React, { FCC } from 'react';

import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';

import { BootableResource } from '../../utils/types';

type BootableVolumeArchitectureCellProps = {
  row: BootableResource;
};

const BootableVolumeArchitectureCell: FCC<BootableVolumeArchitectureCellProps> = ({ row }) => (
  <ArchitectureLabel architecture={getArchitecture(row)} />
);

export default BootableVolumeArchitectureCell;
