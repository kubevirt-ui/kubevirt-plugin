import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

export const ALL_NETWORKS = 'All networks';

export const MONITORING_LINK = `/monitoring/dashboards/grafana-dashboard-kubevirt-top-consumers?project-dropdown-value=${encodeURIComponent(
  ALL_NAMESPACES_SESSION_KEY,
)}`;
