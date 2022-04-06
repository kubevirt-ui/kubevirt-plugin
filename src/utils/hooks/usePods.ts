import { modelToGroupVersionKind, PodModel } from '@kubevirt-ui/kubevirt-api/console';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

/**
 * @date 3/20/2022 - 8:59:40 AM
 *
 * @typedef {UsePods}
 */
type UsePods = (namespace: string) => [K8sResourceCommon[], boolean, any];

/**
 * Get namespace pods
 * @date 3/20/2022 - 8:59:40 AM
 *
 * @param {string} namespace - namespace
 * @returns {[K8sResourceCommon[], boolean, any]}
 */
export const usePods: UsePods = (namespace) => {
  const [pods, podsLoaded, podsError] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(PodModel),
    namespace: namespace,
    isList: true,
  });

  return [pods, podsLoaded, podsError];
};
