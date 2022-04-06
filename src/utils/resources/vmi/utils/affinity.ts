import {
  K8sIoApiCoreV1Affinity,
  K8sIoApiCoreV1NodeAffinity,
  K8sIoApiCoreV1NodeSelectorTerm,
  K8sIoApiCoreV1PodAffinity,
  K8sIoApiCoreV1PodAffinityTerm,
  K8sIoApiCoreV1PodAntiAffinity,
  K8sIoApiCoreV1PreferredSchedulingTerm,
  K8sIoApiCoreV1WeightedPodAffinityTerm,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

/**
 * AffinityCondition enum
 * @date 3/14/2022 - 12:57:30 PM
 *
 * @export
 * @enum {number}
 */
export enum AffinityCondition {
  required = 'requiredDuringSchedulingIgnoredDuringExecution',
  preferred = 'preferredDuringSchedulingIgnoredDuringExecution',
}

/**
 * Get node affinity (requiredDuringSchedulingIgnoredDuringExecution, preferredDuringSchedulingIgnoredDuringExecution)
 * @date 3/14/2022 - 12:57:30 PM
 *
 * @param {K8sIoApiCoreV1NodeAffinity} nodeAffinity - node affinity
 * @returns {((K8sIoApiCoreV1PreferredSchedulingTerm | K8sIoApiCoreV1NodeSelectorTerm)[])}
 */
const getNodeAffinity = (
  nodeAffinity: K8sIoApiCoreV1NodeAffinity,
): (K8sIoApiCoreV1PreferredSchedulingTerm | K8sIoApiCoreV1NodeSelectorTerm)[] => {
  return [
    ...(nodeAffinity?.[AffinityCondition.preferred] || []),
    ...(nodeAffinity?.[AffinityCondition.required]?.nodeSelectorTerms || []),
  ];
};

/**
 * Get pod affinity (requiredDuringSchedulingIgnoredDuringExecution, preferredDuringSchedulingIgnoredDuringExecution)
 * @date 3/14/2022 - 12:57:30 PM
 *
 * @param {(K8sIoApiCoreV1PodAffinity | K8sIoApiCoreV1PodAntiAffinity)} podAffinity - pod affinity
 * @returns {((K8sIoApiCoreV1WeightedPodAffinityTerm | K8sIoApiCoreV1PodAffinityTerm)[])}
 */
const getPodAffinity = (
  podAffinity: K8sIoApiCoreV1PodAffinity | K8sIoApiCoreV1PodAntiAffinity,
): (K8sIoApiCoreV1WeightedPodAffinityTerm | K8sIoApiCoreV1PodAffinityTerm)[] => {
  return [
    ...(podAffinity?.[AffinityCondition.preferred] || []),
    ...(podAffinity?.[AffinityCondition.required] || []),
  ];
};

/**
 * Get affinity rules 
 * @date 3/14/2022 - 12:57:30 PM
 *
 * @param {K8sIoApiCoreV1Affinity} affinity - affinity
 * @returns {((
  | K8sIoApiCoreV1PreferredSchedulingTerm
  | K8sIoApiCoreV1NodeSelectorTerm
  | K8sIoApiCoreV1WeightedPodAffinityTerm
  | K8sIoApiCoreV1PodAffinityTerm
)[])}
 */
export const getAffinityRules = (
  affinity: K8sIoApiCoreV1Affinity,
): (
  | K8sIoApiCoreV1PreferredSchedulingTerm
  | K8sIoApiCoreV1NodeSelectorTerm
  | K8sIoApiCoreV1WeightedPodAffinityTerm
  | K8sIoApiCoreV1PodAffinityTerm
)[] => {
  const nodeAffinity = getNodeAffinity(affinity?.nodeAffinity);
  const podAffinity = getPodAffinity(affinity?.podAffinity);
  const podAntiAffinity = getPodAffinity(affinity?.podAntiAffinity);
  return [...nodeAffinity, ...podAffinity, ...podAntiAffinity];
};
