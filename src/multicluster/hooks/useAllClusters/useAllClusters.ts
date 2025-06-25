import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { ManagedClusterModel } from '@multicluster/constants';
import { useAccessReview, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useAllClusters = () => {
  const canListManagedClusters = useAccessReview({
    group: ManagedClusterModel.apiGroup,
    resource: ManagedClusterModel.plural,
    verb: 'list',
  });

  return useK8sWatchResource<K8sResourceCommon[]>(
    canListManagedClusters
      ? {
          groupVersionKind: modelToGroupVersionKind(ManagedClusterModel),
          isList: true,
          namespaced: false,
        }
      : null,
  );
};

export default useAllClusters;
