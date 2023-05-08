import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
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
import { get, has, intersectionWith, isEmpty } from '@kubevirt-utils/utils/utils';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import { AffinityCondition, AffinityLabel, AffinityRowData, AffinityType } from './types';

const setIDsToEntity = (entity: any[]) => entity?.map((elm, i) => ({ ...elm, id: i }));

const getNodeAffinityRows = (nodeAffinity: K8sIoApiCoreV1NodeAffinity): AffinityRowData[] => {
  const requiredTerms =
    nodeAffinity?.requiredDuringSchedulingIgnoredDuringExecution?.nodeSelectorTerms || [];
  const preferredTerms = nodeAffinity?.preferredDuringSchedulingIgnoredDuringExecution || [];

  const required = requiredTerms.map(({ matchExpressions, matchFields }, i) => ({
    id: `node-required-${i}`,
    type: AffinityType.node,
    condition: AffinityCondition.required,
    expressions: setIDsToEntity(matchExpressions),
    fields: setIDsToEntity(matchFields),
  }));

  const preferred = preferredTerms.map(({ preference, weight }, i) => ({
    id: `node-preferred-${i}`,
    weight,
    type: AffinityType.node,
    condition: AffinityCondition.preferred,
    expressions: setIDsToEntity(preference.matchExpressions),
    fields: setIDsToEntity(preference.matchFields),
  }));

  return [...required, ...preferred] as AffinityRowData[];
};

const getPodLikeAffinityRows = (
  podLikeAffinity: K8sIoApiCoreV1PodAffinity | K8sIoApiCoreV1PodAntiAffinity,
  isAnti = false,
): AffinityRowData[] => {
  const requiredTerms = podLikeAffinity?.requiredDuringSchedulingIgnoredDuringExecution || [];
  const preferredTerms = podLikeAffinity?.preferredDuringSchedulingIgnoredDuringExecution || [];

  const required = requiredTerms?.map((podAffinityTerm, i) => ({
    id: isAnti ? `pod-anti-required-${i}` : `pod-required-${i}`,
    type: isAnti ? AffinityType.podAnti : AffinityType.pod,
    condition: AffinityCondition.required,
    expressions: setIDsToEntity(podAffinityTerm?.labelSelector?.matchExpressions),
    namespaces: podAffinityTerm?.namespaces,
    topologyKey: podAffinityTerm?.topologyKey,
  }));

  const preferred = preferredTerms?.map(({ podAffinityTerm, weight }, i) => ({
    id: isAnti ? `pod-anti-preferred-${i}` : `pod-preferred-${i}`,
    type: isAnti ? AffinityType.podAnti : AffinityType.pod,
    condition: AffinityCondition.preferred,
    weight,
    expressions: setIDsToEntity(podAffinityTerm?.labelSelector?.matchExpressions),
    namespaces: podAffinityTerm?.namespaces,
    topologyKey: podAffinityTerm?.topologyKey,
  }));

  return [...required, ...preferred] as AffinityRowData[];
};

export const getRowsDataFromAffinity = (affinity: K8sIoApiCoreV1Affinity): AffinityRowData[] => [
  ...getNodeAffinityRows(affinity?.nodeAffinity),
  ...getPodLikeAffinityRows(affinity?.podAffinity),
  ...getPodLikeAffinityRows(affinity?.podAntiAffinity, true),
];

const flattenExpressions = (affinityLabels: AffinityLabel[]) =>
  affinityLabels?.map((aff) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...affinityWithoutID } = aff;

    return aff.operator === 'Exists' || aff.operator === 'DoesNotExist'
      ? { ...affinityWithoutID, values: [] }
      : affinityWithoutID;
  });

const getRequiredNodeTermFromRowData = ({
  expressions,
  fields,
}: AffinityRowData): K8sIoApiCoreV1NodeSelectorTerm => ({
  matchExpressions: flattenExpressions(expressions),
  matchFields: flattenExpressions(fields),
});

const getPreferredNodeTermFromRowData = ({
  weight,
  expressions,
  fields,
}: AffinityRowData): K8sIoApiCoreV1PreferredSchedulingTerm => ({
  weight,
  preference: {
    matchExpressions: flattenExpressions(expressions),
    matchFields: flattenExpressions(fields),
  },
});

const getRequiredPodTermFromRowData = ({
  expressions,
  topologyKey,
}: AffinityRowData): K8sIoApiCoreV1PodAffinityTerm => ({
  labelSelector: {
    matchExpressions: flattenExpressions(expressions),
  },
  topologyKey,
});

const getPreferredPodTermFromRowData = ({
  weight,
  expressions,
  topologyKey,
}: AffinityRowData): K8sIoApiCoreV1WeightedPodAffinityTerm => ({
  weight,
  podAffinityTerm: {
    labelSelector: {
      matchExpressions: flattenExpressions(expressions),
    },
    topologyKey,
  },
});

export const getAffinityFromRowsData = (affinityRows: AffinityRowData[]) => {
  if (affinityRows.length === 0) {
    return null;
  }

  const pickRows = (rowType, rowCondition, mapper) =>
    affinityRows
      .filter(({ type, condition }) => type === rowType && condition === rowCondition)
      .map((rowData) => mapper(rowData));

  const affinity = {} as K8sIoApiCoreV1Affinity;

  const nodeSelectorTermsRequired = pickRows(
    AffinityType.node,
    AffinityCondition.required,
    getRequiredNodeTermFromRowData,
  );

  const nodeSelectorTermsPreffered = pickRows(
    AffinityType.node,
    AffinityCondition.preferred,
    getPreferredNodeTermFromRowData,
  );

  const podAffinityTermsRequired = pickRows(
    AffinityType.pod,
    AffinityCondition.required,
    getRequiredPodTermFromRowData,
  );

  const podAffinityTermsPreffered = pickRows(
    AffinityType.pod,
    AffinityCondition.preferred,
    getPreferredPodTermFromRowData,
  );

  const antiPodAffinityTermsRequired = pickRows(
    AffinityType.podAnti,
    AffinityCondition.required,
    getRequiredPodTermFromRowData,
  );

  const antiPodAffinityTermsPreffered = pickRows(
    AffinityType.podAnti,
    AffinityCondition.preferred,
    getPreferredPodTermFromRowData,
  );

  if (!isEmpty(nodeSelectorTermsRequired)) {
    affinity.nodeAffinity = {
      requiredDuringSchedulingIgnoredDuringExecution: {
        nodeSelectorTerms: nodeSelectorTermsRequired,
      },
    };
  }

  if (!isEmpty(nodeSelectorTermsPreffered)) {
    affinity.nodeAffinity = {
      preferredDuringSchedulingIgnoredDuringExecution: nodeSelectorTermsPreffered,
    };
  }

  if (!isEmpty(podAffinityTermsRequired)) {
    affinity.podAffinity = {
      requiredDuringSchedulingIgnoredDuringExecution: podAffinityTermsRequired,
    };
  }

  if (!isEmpty(podAffinityTermsPreffered)) {
    affinity.podAffinity = {
      preferredDuringSchedulingIgnoredDuringExecution: podAffinityTermsPreffered,
    };
  }

  if (!isEmpty(antiPodAffinityTermsRequired)) {
    affinity.podAntiAffinity = {
      requiredDuringSchedulingIgnoredDuringExecution: antiPodAffinityTermsRequired,
    };
  }

  if (!isEmpty(antiPodAffinityTermsPreffered)) {
    affinity.podAntiAffinity = {
      preferredDuringSchedulingIgnoredDuringExecution: antiPodAffinityTermsPreffered,
    };
  }

  return affinity;
};

export const withOperatorPredicate = <T extends AffinityLabel = AffinityLabel>(
  store: any,
  label: T,
) => {
  const { key, values, operator } = label;

  switch (operator) {
    case 'Exists':
      return has(store, key);
    case 'DoesNotExist':
      return !has(store, key);
    case 'In':
      return values?.some((singleValue) => get(store, key) === singleValue);
    case 'NotIn':
      return values?.every((singleValue) => get(store, key) !== singleValue);
    default:
      return values
        ? values?.some((singleValue) => get(store, key) === singleValue)
        : get(store, key) === '';
  }
};

export const getAvailableAffinityID = (affinities: AffinityRowData[]) => {
  const idSet = new Set(affinities.map((aff) => aff.id));
  let id = 1;
  while (idSet.has(id.toString())) {
    id++;
  }
  return id.toString();
};

export const isTermsInvalid = (terms: AffinityLabel[]) =>
  terms?.some(
    ({ key, values, operator }) =>
      !key || ((operator === Operator.In || operator === Operator.NotIn) && values?.length === 0),
  );

export const getIntersectedQualifiedNodes = ({
  expressions,
  fields,
  expressionNodes,
  fieldNodes,
}: {
  expressions: AffinityLabel[];
  fields: AffinityLabel[];
  expressionNodes: IoK8sApiCoreV1Node[];
  fieldNodes: IoK8sApiCoreV1Node[];
}) => {
  if (expressions.length > 0 && fields.length > 0) {
    return intersectionWith(expressionNodes, fieldNodes);
  }
  if (expressions.length > 0) {
    return expressionNodes;
  }
  if (fields.length > 0) {
    return fieldNodes;
  }
  return [];
};
