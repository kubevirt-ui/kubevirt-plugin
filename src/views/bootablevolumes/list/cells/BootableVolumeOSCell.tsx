import React, { FC } from 'react';

import { BootableResource } from '../../utils/types';
import { getPreferenceReadableOS } from '../../utils/utils';
import { BootableVolumeCallbacks } from '../bootableVolumesDefinition';
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
