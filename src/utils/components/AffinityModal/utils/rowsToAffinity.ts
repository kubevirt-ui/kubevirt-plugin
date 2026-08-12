import {
  type K8sIoApiCoreV1Affinity,
  type K8sIoApiCoreV1NodeSelectorRequirement,
  K8sIoApiCoreV1NodeSelectorRequirementOperatorEnum,
  type K8sIoApiCoreV1NodeSelectorTerm,
  type K8sIoApiCoreV1PodAffinityTerm,
  type K8sIoApiCoreV1PreferredSchedulingTerm,
  type K8sIoApiCoreV1WeightedPodAffinityTerm,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { AffinityCondition, type AffinityLabel, type AffinityRowData, AffinityType } from './types';

const flattenExpressions = (
  affinityLabels: AffinityLabel[],
): K8sIoApiCoreV1NodeSelectorRequirement[] =>
  affinityLabels?.map((aff) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...affinityWithoutID } = aff;

    const affinityRequirement = { ...affinityWithoutID } as K8sIoApiCoreV1NodeSelectorRequirement;
    return aff.operator === K8sIoApiCoreV1NodeSelectorRequirementOperatorEnum.Exists ||
      aff.operator === K8sIoApiCoreV1NodeSelectorRequirementOperatorEnum.DoesNotExist
      ? { ...affinityRequirement, values: [] }
      : affinityRequirement;
  });

const getRequiredNodeTermFromRowData = ({
  expressions,
  fields,
}: AffinityRowData): K8sIoApiCoreV1NodeSelectorTerm => ({
  matchExpressions: flattenExpressions(expressions),
  matchFields: flattenExpressions(fields),
});

const getPreferredNodeTermFromRowData = ({
  expressions,
  fields,
  weight,
}: AffinityRowData): K8sIoApiCoreV1PreferredSchedulingTerm => ({
  preference: {
    matchExpressions: flattenExpressions(expressions),
    matchFields: flattenExpressions(fields),
  },
  weight,
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
  expressions,
  topologyKey,
  weight,
}: AffinityRowData): K8sIoApiCoreV1WeightedPodAffinityTerm => ({
  podAffinityTerm: {
    labelSelector: {
      matchExpressions: flattenExpressions(expressions),
    },
    topologyKey,
  },
  weight,
});

export const getAffinityFromRowsData = (
  affinityRows: AffinityRowData[],
): K8sIoApiCoreV1Affinity => {
  if (affinityRows.length === 0) {
    return null;
  }

  const pickRows = <T>(
    rowType: AffinityType,
    rowCondition: AffinityCondition,
    mapper: (row: AffinityRowData) => T,
  ): T[] =>
    affinityRows
      .filter(({ condition, type }) => type === rowType && condition === rowCondition)
      .map((rowData) => mapper(rowData));

  const affinity = {} as K8sIoApiCoreV1Affinity;

  const nodeSelectorTermsRequired = pickRows(
    AffinityType.node,
    AffinityCondition.required,
    getRequiredNodeTermFromRowData,
  );

  const nodeSelectorTermsPreferred = pickRows(
    AffinityType.node,
    AffinityCondition.preferred,
    getPreferredNodeTermFromRowData,
  );

  const podAffinityTermsRequired = pickRows(
    AffinityType.pod,
    AffinityCondition.required,
    getRequiredPodTermFromRowData,
  );

  const podAffinityTermsPreferred = pickRows(
    AffinityType.pod,
    AffinityCondition.preferred,
    getPreferredPodTermFromRowData,
  );

  const antiPodAffinityTermsRequired = pickRows(
    AffinityType.podAnti,
    AffinityCondition.required,
    getRequiredPodTermFromRowData,
  );

  const antiPodAffinityTermsPreferred = pickRows(
    AffinityType.podAnti,
    AffinityCondition.preferred,
    getPreferredPodTermFromRowData,
  );

  if (!isEmpty(nodeSelectorTermsRequired)) {
    affinity.nodeAffinity = {
      ...affinity.nodeAffinity,
      requiredDuringSchedulingIgnoredDuringExecution: {
        nodeSelectorTerms: nodeSelectorTermsRequired,
      },
    };
  }

  if (!isEmpty(nodeSelectorTermsPreferred)) {
    affinity.nodeAffinity = {
      ...affinity.nodeAffinity,
      preferredDuringSchedulingIgnoredDuringExecution: nodeSelectorTermsPreferred,
    };
  }

  if (!isEmpty(podAffinityTermsRequired)) {
    affinity.podAffinity = {
      ...affinity.podAffinity,
      requiredDuringSchedulingIgnoredDuringExecution: podAffinityTermsRequired,
    };
  }

  if (!isEmpty(podAffinityTermsPreferred)) {
    affinity.podAffinity = {
      ...affinity.podAffinity,
      preferredDuringSchedulingIgnoredDuringExecution: podAffinityTermsPreferred,
    };
  }

  if (!isEmpty(antiPodAffinityTermsRequired)) {
    affinity.podAntiAffinity = {
      ...affinity.podAntiAffinity,
      requiredDuringSchedulingIgnoredDuringExecution: antiPodAffinityTermsRequired,
    };
  }

  if (!isEmpty(antiPodAffinityTermsPreferred)) {
    affinity.podAntiAffinity = {
      ...affinity.podAntiAffinity,
      preferredDuringSchedulingIgnoredDuringExecution: antiPodAffinityTermsPreferred,
    };
  }

  return affinity;
};
