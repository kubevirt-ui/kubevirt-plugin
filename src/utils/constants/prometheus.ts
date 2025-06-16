import { PERSPECTIVES } from '@kubevirt-utils/constants/constants';
import { AlertResource } from '@overview/OverviewTab/status-card/utils/utils';

export const MONITORING_SALT = 'monitoring-salt';
export const OPERATOR_LABEL_KEY = 'kubernetes_operator_part_of';

export const getAlertsBasePath = (perspective: string, namespace?: string) => {
  switch (perspective) {
    case PERSPECTIVES.ACM:
      return `/multicloud${AlertResource.plural}`;
    case PERSPECTIVES.ADMIN:
      return AlertResource.plural;
    case PERSPECTIVES.VIRTUALIZATION:
      return `/virt-monitoring/alerts`;
    case PERSPECTIVES.DEVELOPER:
    default:
      return `/dev-monitoring/ns/${namespace}/alerts`;
  }
};

export const getAlertsPath = (perspective: string, namespace?: string, suffix?: string) =>
  `${getAlertsBasePath(perspective, namespace)}${suffix}`;
