import { AlertType } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { AlertsBySeverity } from '@kubevirt-utils/hooks/useInfrastructureAlerts/useInfrastructureAlerts';
import { OPERATOR_HEALTH_IMPACT_LABEL } from '@kubevirt-utils/hooks/useInfrastructureAlerts/utils/constants';
import { Alert, AlertStates } from '@openshift-console/dynamic-plugin-sdk';

import { HealthImpactLevel } from '../../../../views/dashboard-extensions/KubevirtHealthPopup/utils/types';

export const isFiringOrSilencedAlert = (alert: Alert): boolean =>
  alert?.state === AlertStates.Firing || alert?.state === AlertStates.Silenced;

const getHealthImpact = (alert: Alert) => alert?.labels?.[OPERATOR_HEALTH_IMPACT_LABEL];

export const isCriticalHealthImpactAlert = (alert: Alert): boolean =>
  getHealthImpact(alert) === HealthImpactLevel.critical;

export const isImportantInfrastructureAlert = (alert: Alert) => {
  const healthImpact = getHealthImpact(alert);
  return (
    healthImpact &&
    (healthImpact === HealthImpactLevel.warning || healthImpact === HealthImpactLevel.critical)
  );
};

export const sortAlertsBySeverity = (alerts: Alert[]): AlertsBySeverity =>
  alerts?.reduce(
    (acc, alert) => {
      const severity = alert?.labels?.severity as AlertType;
      if (severity && acc[severity]) acc[severity].push(alert);
      return acc;
    },
    { [AlertType.critical]: [], [AlertType.info]: [], [AlertType.warning]: [] } as AlertsBySeverity,
  ) ?? { [AlertType.critical]: [], [AlertType.info]: [], [AlertType.warning]: [] };

export const getNumberOfAlerts = (alerts: AlertsBySeverity) =>
  Object.values(alerts)?.reduce((acc, alertsForLevel) => {
    acc += alertsForLevel?.length || 0;
    return acc;
  }, 0);
