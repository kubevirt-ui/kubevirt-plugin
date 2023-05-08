import { Alert, AlertStates } from '@openshift-console/dynamic-plugin-sdk';

export const getFiringAlerts = (alerts: Alert[]): Alert[] =>
  alerts.filter((alert) => alert.state === AlertStates.Firing);
