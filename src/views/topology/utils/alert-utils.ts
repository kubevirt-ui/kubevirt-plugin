import sortBy from 'lodash.sortby';

import { Alert, AlertSeverity, Rule } from '@openshift-console/dynamic-plugin-sdk';

type ListOrder = (number | string)[];

// Severity sort order is "critical" > "warning" > (anything else in A-Z order) > "none"
export const alertSeverityOrder = (alert: Alert | Rule): ListOrder => {
  const { severity } = alert.labels;
  const order: number =
    {
      [AlertSeverity.Critical]: 1,
      [AlertSeverity.Warning]: 2,
      [AlertSeverity.None]: 4,
    }[severity] ?? 3;
  return [order, severity];
};

export const sortMonitoringAlerts = (alerts: Alert[]): Alert[] =>
  sortBy(alerts, alertSeverityOrder) as Alert[];

export const getSeverityAlertType = (alerts: Alert[]): AlertSeverity => {
  const sortedAlerts = sortMonitoringAlerts(alerts);
  return (sortedAlerts[0]?.labels?.severity as AlertSeverity) ?? AlertSeverity.None;
};
