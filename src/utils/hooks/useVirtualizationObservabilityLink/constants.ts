export const VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAME =
  'grafana-dashboard-acm-openshift-virtualization-clusters-overview';

export const VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAMESPACE =
  'open-cluster-management-observability';
const OBSERVABILITY_CONTROLLER_NAME = 'observability-controller';

const MULTICLUSTER_OBSERVABILITY_ADDON_NAME = 'multicluster-observability-addon';

export const OBSERVABILITY_CMA_NAMES = [
  OBSERVABILITY_CONTROLLER_NAME,
  MULTICLUSTER_OBSERVABILITY_ADDON_NAME,
] as const;

export const VIRTUALIZATION_OBSERVABILITY_DASHBOARD_JSON_NAME =
  'acm-openshift-virtualization-clusters-overview.json';

export const VIRTUALIZATION_OBSERVABILITY_DASHBOARD_ANNOTATION =
  'console.open-cluster-management.io/launch-link';
