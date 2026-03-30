import React, { FC } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';

import { BootableResource } from '../../utils/types';

type BootableVolumeClusterCellProps = {
  row: BootableResource;
};

const BootableVolumeClusterCell: FC<BootableVolumeClusterCellProps> = ({ row }) => (
  <MulticlusterResourceLink
    groupVersionKind={modelToGroupVersionKind(ManagedClusterModel)}
    name={getCluster(row)}
  />
);

export default BootableVolumeClusterCell;
