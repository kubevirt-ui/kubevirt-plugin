import React, { FCC } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { isBootableVolumePVCKind } from '@kubevirt-utils/resources/bootableresources/helpers';

import DataSourceActions from '../../../datasources/actions/DataSourceActions';
import BootableVolumesActions from '../../actions/BootableVolumesActions';
import { BootableResource } from '../../utils/types';
import { BootableVolumeCallbacks } from '../bootableVolumesDefinition';
import { getClusterPreferences, getEffectiveCluster } from '../utils/helpers';

type BootableVolumeActionsCellProps = {
  callbacks: BootableVolumeCallbacks;
  row: BootableResource;
};

const BootableVolumeActionsCell: FCC<BootableVolumeActionsCellProps> = ({ callbacks, row }) => {
  const cluster = getEffectiveCluster(row, callbacks);
  const clusterPreferences = getClusterPreferences(cluster, callbacks.preferences);

  if (isBootableVolumePVCKind(row)) {
    return <BootableVolumesActions preferences={clusterPreferences} source={row} />;
  }

  return <DataSourceActions dataSource={row as V1beta1DataSource} isKebabToggle />;
};

export default BootableVolumeActionsCell;
