import { AffinityCondition, AffinityType } from '../../../utils/types';

export const AFFINITY_CONDITION_LABELS = {
  [AffinityCondition.Preferred]: 'Preferred during scheduling',
  [AffinityCondition.Required]: 'Required during scheduling',
};

export const AFFINITY_TYPE_LABLES = {
  [AffinityType.Node]: 'Node Affinity',
  [AffinityType.Pod]: 'Workload (pod) Affinity',
  [AffinityType.PodAnti]: 'Workload (pod) Anti-Affinity',
};
