import React, { FCC } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

type TemplateClusterCellProps = {
  row: TemplateOrRequest;
};

const TemplateClusterCell: FCC<TemplateClusterCellProps> = ({ row }) => {
  const [hubClusterName] = useHubClusterName();
  const cluster = getCluster(row) || hubClusterName;

  return (
    <ResourceLink groupVersionKind={modelToGroupVersionKind(ManagedClusterModel)} name={cluster} />
  );
};

export default TemplateClusterCell;
