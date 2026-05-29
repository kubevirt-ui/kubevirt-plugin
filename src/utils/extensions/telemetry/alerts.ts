import { ALERT_FIRED, ALERT_INTERACTED, ALERT_RESOLVED, ALERT_SILENCED } from './utils/constants';
import { AlertActionTelemetry } from './utils/types';
import { eventMonitor } from './telemetry';

export const logAlertFired = (properties: {
  alertName: string;
  frequency?: number;
  namespace?: string;
  severity?: 'critical' | 'info' | 'warning';
}) => {
  eventMonitor(ALERT_FIRED, properties);
};

export const logAlertInteracted = (
  alertName: string,
  action: AlertActionTelemetry,
  severity?: string,
) => {
  eventMonitor(ALERT_INTERACTED, { action, alertName, severity });
};

export const logAlertResolved = (alertName: string, severity?: string) => {
  eventMonitor(ALERT_RESOLVED, { alertName, severity });
};

export const logAlertSilenced = (
  alertName: string,
  silenceDurationHours: number,
  severity?: string,
) => {
  eventMonitor(ALERT_SILENCED, { alertName, severity, silenceDurationHours });
};
