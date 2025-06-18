import { useAccessReview, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useAllClusters = () => {
  const canListManagedClusters = useAccessReview({
    group: 'cluster.open-cluster-management.io',
    namespace: '',
    resource: 'managedclusters',
    verb: 'list',
  });

  return useK8sWatchResource<K8sResourceCommon[]>(
    canListManagedClusters
      ? {
          groupVersionKind: {
            group: 'cluster.open-cluster-management.io',
            kind: 'ManagedCluster',
            version: 'v1',
          },
          isList: true,
          namespaced: false,
        }
      : null,
  );
};

export default useAllClusters;
