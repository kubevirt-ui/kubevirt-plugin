import React, { FC } from 'react';

import { modelToGroupVersionKind, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

type TemplateClusterCellProps = {
  row: V1Template;
};

const TemplateClusterCell: FC<TemplateClusterCellProps> = ({ row }) => {
  const [hubClusterName] = useHubClusterName();
  const cluster = getCluster(row) || hubClusterName;

  return (
    <ResourceLink groupVersionKind={modelToGroupVersionKind(ManagedClusterModel)} name={cluster} />
  );
};

export default TemplateClusterCell;
