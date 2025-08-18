import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { ALL_CLUSTERS, ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import { ManagedClusterModel } from '@multicluster/constants';

export const getClusterOptions = (includeAllClusters: boolean, clusterNames: string[]) => {
  const clusterOptions = clusterNames
    .sort((a, b) => a.localeCompare(b))
    .map((clusterName) => {
      return {
        children: clusterName,
        groupVersionKind: modelToGroupVersionKind(ManagedClusterModel),
        value: clusterName,
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
