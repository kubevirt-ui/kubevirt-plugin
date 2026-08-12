import {
  type K8sIoApiCoreV1Affinity,
  type K8sIoApiCoreV1NodeAffinity,
  type K8sIoApiCoreV1PodAffinity,
  type K8sIoApiCoreV1PodAntiAffinity,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { AffinityCondition, type AffinityRowData, AffinityType } from './types';

const setIDsToEntity = <T>(entity: T[]): (T & { id: number })[] =>
  entity?.map((elm, i) => ({ ...elm, id: i }));

const getNodeAffinityRows = (nodeAffinity: K8sIoApiCoreV1NodeAffinity): AffinityRowData[] => {
  const requiredTerms =
    nodeAffinity?.requiredDuringSchedulingIgnoredDuringExecution?.nodeSelectorTerms ?? [];
  const preferredTerms = nodeAffinity?.preferredDuringSchedulingIgnoredDuringExecution ?? [];

  const required = requiredTerms.map(({ matchExpressions, matchFields }, i) => ({
    condition: AffinityCondition.required,
    expressions: setIDsToEntity(matchExpressions),
    fields: setIDsToEntity(matchFields),
    id: `node-required-${i}`,
    type: AffinityType.node,
  }));

  const preferred = preferredTerms.map(({ preference, weight }, i) => ({
    condition: AffinityCondition.preferred,
    expressions: setIDsToEntity(preference.matchExpressions),
    fields: setIDsToEntity(preference.matchFields),
    id: `node-preferred-${i}`,
    type: AffinityType.node,
    weight,
  }));

  return [...required, ...preferred] as AffinityRowData[];
};

const getPodLikeAffinityRows = (
  podLikeAffinity: K8sIoApiCoreV1PodAffinity | K8sIoApiCoreV1PodAntiAffinity,
  isAnti = false,
): AffinityRowData[] => {
  const requiredTerms = podLikeAffinity?.requiredDuringSchedulingIgnoredDuringExecution ?? [];
  const preferredTerms = podLikeAffinity?.preferredDuringSchedulingIgnoredDuringExecution ?? [];

  const required = requiredTerms?.map((podAffinityTerm, i) => ({
    condition: AffinityCondition.required,
    expressions: setIDsToEntity(podAffinityTerm?.labelSelector?.matchExpressions),
    id: isAnti ? `pod-anti-required-${i}` : `pod-required-${i}`,
    namespaces: podAffinityTerm?.namespaces,
    topologyKey: podAffinityTerm?.topologyKey,
    type: isAnti ? AffinityType.podAnti : AffinityType.pod,
  }));

  const preferred = preferredTerms?.map(({ podAffinityTerm, weight }, i) => ({
    condition: AffinityCondition.preferred,
    expressions: setIDsToEntity(podAffinityTerm?.labelSelector?.matchExpressions),
    id: isAnti ? `pod-anti-preferred-${i}` : `pod-preferred-${i}`,
    namespaces: podAffinityTerm?.namespaces,
    topologyKey: podAffinityTerm?.topologyKey,
    type: isAnti ? AffinityType.podAnti : AffinityType.pod,
    weight,
  }));

  return [...required, ...preferred] as AffinityRowData[];
};

export const getRowsDataFromAffinity = (affinity: K8sIoApiCoreV1Affinity): AffinityRowData[] => [
  ...getNodeAffinityRows(affinity?.nodeAffinity),
  ...getPodLikeAffinityRows(affinity?.podAffinity),
  ...getPodLikeAffinityRows(affinity?.podAntiAffinity, true),
];
