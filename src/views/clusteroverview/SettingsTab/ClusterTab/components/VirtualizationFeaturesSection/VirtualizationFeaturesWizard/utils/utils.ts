import {
  DESCHEDULER_OPERATOR_NAME,
  FENCE_AGENTS_OPERATOR_NAME,
  NETOBSERV_OPERATOR_NAME,
  NMSTATE_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';

export const defaultOperatorsToInstall = {
  [DESCHEDULER_OPERATOR_NAME]: false,
  [FENCE_AGENTS_OPERATOR_NAME]: false,
  [NETOBSERV_OPERATOR_NAME]: false,
  [NMSTATE_OPERATOR_NAME]: false,
  [NODE_HEALTH_OPERATOR_NAME]: false,
};
