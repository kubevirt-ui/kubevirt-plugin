import type { FC } from 'react';
import React from 'react';

import type { BootableVolumeCallbacks } from '../bootableVolumesDefinition';

import type { BootableResource } from '../../utils/types';
import { getPreferenceReadableOS } from '../../utils/utils';
import { getClusterPreferences, getEffectiveCluster } from '../utils/helpers';

type BootableVolumeOSCellProps = {
  callbacks: BootableVolumeCallbacks;
  row: BootableResource;
};

const BootableVolumeOSCell: FC<BootableVolumeOSCellProps> = ({ callbacks, row }) => {
  const cluster = getEffectiveCluster(row, callbacks);
  const clusterPreferences = getClusterPreferences(cluster, callbacks.preferences);

  return <>{getPreferenceReadableOS(row, clusterPreferences, cluster)}</>;
};

export default BootableVolumeOSCell;
