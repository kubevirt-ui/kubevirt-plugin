import { AffinityCondition, AffinityType } from '../../../utils/types';

export const AFFINITY_CONDITION_LABELS = {
  [AffinityCondition.preferred]: 'Preferred during scheduling',
  [AffinityCondition.required]: 'Required during scheduling',
};

export const AFFINITY_TYPE_LABLES = {
  [AffinityType.node]: 'Node Affinity',
  [AffinityType.pod]: 'Workload (pod) Affinity',
  [AffinityType.podAnti]: 'Workload (pod) Anti-Affinity',
};
