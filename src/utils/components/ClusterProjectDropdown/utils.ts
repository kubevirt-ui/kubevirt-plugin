import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { ALL_CLUSTERS, ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { ManagedClusterModel } from '@multicluster/constants';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const getClusterOptions = (includeAllClusters: boolean, clusters: K8sResourceCommon[]) => {
  const clusterOptions = clusters
    .sort((a, b) => getName(a).localeCompare(getName(b)))
    .map((proj) => {
      const name = getName(proj);
      return {
        children: name,
        groupVersionKind: modelToGroupVersionKind(ManagedClusterModel),
        value: name,
      };
    });

  const allClusters = includeAllClusters
    ? [
        {
          children: ALL_CLUSTERS,
          groupVersionKind: modelToGroupVersionKind(ManagedClusterModel),
          value: ALL_CLUSTERS_KEY,
        },
      ].concat(clusterOptions)
    : clusterOptions;

  return allClusters;
};
