import React, { FCC } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { VMCellProps } from './types';

const VMClusterCell: FCC<VMCellProps> = ({ row }) => {
  const clusterParam = useClusterParam();

  if (!row) return null;

  const vmCluster = getCluster(row) ?? clusterParam;

  return (
    <MulticlusterResourceLink
      groupVersionKind={modelToGroupVersionKind(ManagedClusterModel)}
      name={vmCluster}
      truncate
    />
  );
};

export default VMClusterCell;
