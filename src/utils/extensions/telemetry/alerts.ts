import { eventMonitor } from './telemetry';
import { ALERT_FIRED, ALERT_INTERACTED, ALERT_RESOLVED, ALERT_SILENCED } from './utils/constants';
import { type AlertActionTelemetry } from './utils/types';

export const logAlertFired = (properties: {
  alertName: string;
  frequency?: number;
  namespace?: string;
  severity?: 'critical' | 'info' | 'warning';
}): void => {
  eventMonitor(ALERT_FIRED, properties);
};

export const logAlertInteracted = (
  alertName: string,
  action: AlertActionTelemetry,
  severity?: string,
): void => {
  eventMonitor(ALERT_INTERACTED, { action, alertName, severity });
};

export const logAlertResolved = (alertName: string, severity?: string): void => {
  eventMonitor(ALERT_RESOLVED, { alertName, severity });
};

export const logAlertSilenced = (
  alertName: string,
  silenceDurationHours: number,
  severity?: string,
): void => {
  eventMonitor(ALERT_SILENCED, { alertName, severity, silenceDurationHours });
};
