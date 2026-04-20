import React, { FCC } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { VMCellProps } from './types';

const VMNamespaceCell: FCC<VMCellProps> = ({ row }) => {
  const clusterParam = useClusterParam();

  if (!row) return null;

  const vmCluster = getCluster(row) ?? clusterParam;
  const vmNamespace = getNamespace(row);

  return (
    <MulticlusterResourceLink
      cluster={vmCluster}
      groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
      name={vmNamespace}
      truncate
    />
  );
};

export default VMNamespaceCell;
