import { KUBEVIRT } from '@kubevirt-utils/constants/constants';
import { OPERATOR_LABEL_KEY } from '@kubevirt-utils/constants/prometheus';
import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import { OPERATOR_HEALTH_IMPACT_LABEL } from '@kubevirt-utils/hooks/useInfrastructureAlerts/utils/constants';
import { escapePromLabelValue, escapePromRegexValue } from '@kubevirt-utils/utils/prometheus';
import { AlertStates } from '@openshift-console/dynamic-plugin-sdk';

import { OPERATOR_HEALTH_IMPACT } from './constants';

type OperatorHealthImpact =
  | typeof OPERATOR_HEALTH_IMPACT.NONE
  | typeof OPERATOR_HEALTH_IMPACT.NOT_NONE;

export const buildAlertsQuery = (
  cluster?: string,
  hubClusterName?: string,
  operatorHealthImpact?: OperatorHealthImpact,
  severity?: string,
  selectedClusters?: string[],
): string => {
  const filters: string[] = [
    `alertstate="${AlertStates.Firing}"`,
    `${OPERATOR_LABEL_KEY}="${KUBEVIRT}"`,
  ];

  if (operatorHealthImpact === OPERATOR_HEALTH_IMPACT.NOT_NONE) {
    filters.push(`${OPERATOR_HEALTH_IMPACT_LABEL}!="${OPERATOR_HEALTH_IMPACT.NONE}"`);
  } else if (operatorHealthImpact === OPERATOR_HEALTH_IMPACT.NONE) {
    filters.push(`${OPERATOR_HEALTH_IMPACT_LABEL}="${OPERATOR_HEALTH_IMPACT.NONE}"`);
  }

  if (severity) {
    filters.push(`severity="${escapePromLabelValue(severity)}"`);
  }

  // Handle multiple selected clusters using regex match
  if (selectedClusters && selectedClusters.length > 0) {
    // Escape special regex characters and join with |
    const escapedClusters = selectedClusters.map(escapePromRegexValue).join('|');
    filters.push(`cluster=~"${escapedClusters}"`);
  } else if (cluster && cluster !== ALL_CLUSTERS_KEY && cluster !== hubClusterName) {
    filters.push(`cluster="${escapePromLabelValue(cluster)}"`);
  }

  return `ALERTS{${filters.join(',')}}`;
};
