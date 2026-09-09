export type { HealthStateMappingValues } from './healthStateMapping';
export { getHealthStateIcon, healthStateMapping } from './healthStateMapping';

export type MonitoringResource = {
  abbr: string;
  kind: string;
  label: string;
  plural: string;
};

export const AlertResource: MonitoringResource = {
  abbr: 'AL',
  kind: 'Alert',
  label: 'Alert',
  plural: '/monitoring/alerts',
};
