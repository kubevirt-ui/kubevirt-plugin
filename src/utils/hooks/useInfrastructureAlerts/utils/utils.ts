import { AlertsByHealthImpact } from '@kubevirt-utils/hooks/useInfrastructureAlerts/useInfrastructureAlerts';
import { OPERATOR_HEALTH_IMPACT_LABEL } from '@kubevirt-utils/hooks/useInfrastructureAlerts/utils/constants';
import { Alert, AlertStates } from '@openshift-console/dynamic-plugin-sdk';

import { HealthImpactLevel } from '../../../../views/dashboard-extensions/KubevirtHealthPopup/utils/types';

export const isFiringOrSilencedAlert = (alert: Alert): boolean =>
  alert?.state === AlertStates.Firing || alert?.state === AlertStates.Silenced;

const getHealthImpact = (alert: Alert) => alert?.labels?.[OPERATOR_HEALTH_IMPACT_LABEL];

export const isImportantInfrastructureAlert = (alert: Alert) => {
  const healthImpact = getHealthImpact(alert);
  return (
    healthImpact &&
    (healthImpact === HealthImpactLevel.warning || healthImpact === HealthImpactLevel.critical)
  );
};

export const sortAlertsByHealthImpact = (alerts: Alert[]) =>
  alerts?.reduce(
    (acc, alert) => {
      const healthImpact = getHealthImpact(alert);

      if (healthImpact) acc[healthImpact]?.push(alert);
      return acc;
    },
    { critical: [], warning: [], none: [] },
  );

export const getNumberOfAlerts = (alerts: AlertsByHealthImpact) =>
  Object.values(alerts)?.reduce((acc, alertsForImpactLevel) => {
    acc += alertsForImpactLevel?.length || 0;
    return acc;
  }, 0);
