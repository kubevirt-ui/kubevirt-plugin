import type { FC } from 'react';
import React from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import type { BootableResource } from '../../utils/types';
import { getSourcePreferenceLabelValue } from '../../utils/utils';

type BootableVolumePreferenceCellProps = {
  row: BootableResource;
};

const BootableVolumePreferenceCell: FC<BootableVolumePreferenceCellProps> = ({ row }) => (
  <>{getSourcePreferenceLabelValue(row) || NO_DATA_DASH}</>
);

export default BootableVolumePreferenceCell;
