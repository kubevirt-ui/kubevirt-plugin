import { getLabel } from '@kubevirt-utils/resources/shared';
import { WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

import useAllClusters from '../useAllClusters/useAllClusters';

const useHubCluster = (): WatchK8sResult<K8sResourceCommon> => {
  const [allClusters, loaded, error] = useAllClusters();

  return [
    allClusters?.find((cluster) => getLabel(cluster, 'local-cluster') === 'true'),
    loaded,
    error,
  ];
};

export default useHubCluster;
