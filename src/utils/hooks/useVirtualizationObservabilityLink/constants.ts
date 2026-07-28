export const VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAME =
  'grafana-dashboard-acm-openshift-virtualization-clusters-overview';

export const VIRTUALIZATION_OBSERVABILITY_CONFIG_MAP_NAMESPACE =
  'open-cluster-management-observability';

/** Legacy Multicluster Observability ClusterManagementAddOn name. */
export const OBSERVABILITY_CONTROLLER_NAME = 'observability-controller';

/**
 * MCOA (Multicluster Observability Addon) ClusterManagementAddOn name.
 * Replaces the legacy observability-controller CMA when MCOA is enabled.
 */
export const MULTICLUSTER_OBSERVABILITY_ADDON_NAME = 'multicluster-observability-addon';

/** CMA names that indicate ACM observability collection is available. */
export const OBSERVABILITY_CMA_NAMES = [
  OBSERVABILITY_CONTROLLER_NAME,
  MULTICLUSTER_OBSERVABILITY_ADDON_NAME,
] as const;

export const VIRTUALIZATION_OBSERVABILITY_DASHBOARD_JSON_NAME =
  'acm-openshift-virtualization-clusters-overview.json';

export const VIRTUALIZATION_OBSERVABILITY_DASHBOARD_ANNOTATION =
  'console.open-cluster-management.io/launch-link';
