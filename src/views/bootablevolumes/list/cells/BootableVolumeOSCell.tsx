import React, { FC } from 'react';

import { BootableResource } from '../../utils/types';
import { getBootableVolumeOSDisplayValue } from '../utils/helpers';
import { BootableVolumeCallbacks } from '../bootableVolumesDefinition';

type BootableVolumeOSCellProps = {
  callbacks: BootableVolumeCallbacks;
  row: BootableResource;
};

const BootableVolumeOSCell: FC<BootableVolumeOSCellProps> = ({ callbacks, row }) => (
  <>{getBootableVolumeOSDisplayValue(row, callbacks)}</>
);

export default BootableVolumeOSCell;
