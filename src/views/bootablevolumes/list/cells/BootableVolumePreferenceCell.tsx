import React, { FCC } from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { BootableResource } from '../../utils/types';
import { getSourcePreferenceLabelValue } from '../../utils/utils';

type BootableVolumePreferenceCellProps = {
  row: BootableResource;
};

const BootableVolumePreferenceCell: FCC<BootableVolumePreferenceCellProps> = ({ row }) => (
  <>{getSourcePreferenceLabelValue(row) || NO_DATA_DASH}</>
);

export default BootableVolumePreferenceCell;
