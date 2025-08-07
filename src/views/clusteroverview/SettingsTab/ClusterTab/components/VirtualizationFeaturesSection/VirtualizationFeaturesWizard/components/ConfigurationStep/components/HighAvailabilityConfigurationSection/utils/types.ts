import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';

export type HAAlternativeCheckedMap = {
  [FENCE_AGENTS_OPERATOR_NAME]: boolean;
  [NODE_HEALTH_OPERATOR_NAME]: boolean;
};
