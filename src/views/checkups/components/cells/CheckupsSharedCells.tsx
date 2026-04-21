import React, { FC } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

export const ClusterCell: FC<{ row: IoK8sApiCoreV1ConfigMap }> = ({ row }) => {
  const [hubClusterName] = useHubClusterName();
  const cluster = getCluster(row) || hubClusterName;

  return (
    <ResourceLink groupVersionKind={modelToGroupVersionKind(ManagedClusterModel)} name={cluster} />
  );
};

export const NamespaceCell: FC<{ row: IoK8sApiCoreV1ConfigMap }> = ({ row }) => {
  const [hubClusterName] = useHubClusterName();
  const isACMPage = useIsACMPage();
  const cluster = getCluster(row) || hubClusterName;

  return (
    <MulticlusterResourceLink
      cluster={isACMPage ? cluster : undefined}
      groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
      name={row?.metadata?.namespace}
    />
  );
};
