import { modelToGroupVersionKind, PodModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

/**
 * @date 3/20/2022 - 8:59:40 AM
 *
 * @typedef {UsePods}
 */
type UsePods = (namespace: string, cluster?: string) => [K8sResourceCommon[], boolean, any];

/**
 * Get namespace pods
 * @date 3/20/2022 - 8:59:40 AM
 * @param cluster
 *
 * @param {string} namespace - namespace
 * @returns {[K8sResourceCommon[], boolean, any]}
 */
export const usePods: UsePods = (namespace, cluster) => {
  const clusterParam = useClusterParam();
  const [pods, podsLoaded, podsError] = useK8sWatchData<K8sResourceCommon[]>({
    cluster: cluster || clusterParam,
    groupVersionKind: modelToGroupVersionKind(PodModel),
    isList: true,
    namespace: namespace,
  });

  return [pods, podsLoaded, podsError];
};
