export const ALERTS_BASE_PATH =
  'monitoring/alerts?rowFilter-alert-state=firing,silenced&rowFilter-alert-source=platform&alerts=kubernetes_operator_part_of%3Dkubevirt%2Coperator_health_impact%3D';

export const alertTypeToColorMap = {
  critical: '#C9190B',
  info: '#2B9AF3',
  warning: '#F0AB00',
};
