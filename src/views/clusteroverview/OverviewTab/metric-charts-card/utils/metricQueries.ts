import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

import { METRICS } from './constants';

const metricQueriesForNamespace = {
  [METRICS.MEMORY]: (filters: string) =>
    `sum by (namespace)(kubevirt_vmi_memory_used_bytes{${filters}})`,
  [METRICS.STORAGE]: (filters: string) =>
    `sum by (namespace)(max(kubevirt_vmi_filesystem_used_bytes{${filters}}) by (namespace, name, disk_name))`,
  [METRICS.VCPU_USAGE]: (filters: string) =>
    `count(kubevirt_vmi_vcpu_wait_seconds_total{${filters}})`,
  [METRICS.VM]: (filters: string) =>
    `sum by (namespace)(count by (name,namespace)(kubevirt_vm_error_status_last_transition_timestamp_seconds{${filters}} + kubevirt_vm_migrating_status_last_transition_timestamp_seconds{${filters}} + kubevirt_vm_non_running_status_last_transition_timestamp_seconds{${filters}} + kubevirt_vm_running_status_last_transition_timestamp_seconds{${filters}} + kubevirt_vm_starting_status_last_transition_timestamp_seconds{${filters}}))`,
};

const metricQueriesForAllNamespaces = {
  [METRICS.MEMORY]: (clusterFilter: string) =>
    `sum(kubevirt_vmi_memory_used_bytes${clusterFilter ? `{${clusterFilter}}` : ''})`,
  [METRICS.STORAGE]: (clusterFilter: string) =>
    `sum(max(kubevirt_vmi_filesystem_used_bytes${
      clusterFilter ? `{${clusterFilter}}` : ''
    }) by (namespace, name, disk_name))`,
  [METRICS.VCPU_USAGE]: (clusterFilter: string) =>
    `count(kubevirt_vmi_vcpu_wait_seconds_total${clusterFilter ? `{${clusterFilter}}` : ''})`,
  [METRICS.VM]: (clusterFilter: string) =>
    `sum(count by (name,namespace)(kubevirt_vm_error_status_last_transition_timestamp_seconds${
      clusterFilter ? `{${clusterFilter}}` : ''
    } + kubevirt_vm_migrating_status_last_transition_timestamp_seconds${
      clusterFilter ? `{${clusterFilter}}` : ''
    } + kubevirt_vm_non_running_status_last_transition_timestamp_seconds${
      clusterFilter ? `{${clusterFilter}}` : ''
    } + kubevirt_vm_running_status_last_transition_timestamp_seconds${
      clusterFilter ? `{${clusterFilter}}` : ''
    } + kubevirt_vm_starting_status_last_transition_timestamp_seconds${
      clusterFilter ? `{${clusterFilter}}` : ''
    }))`,
};

export const getMetricQuery = (
  metric: string,
  namespace: string,
  cluster?: string,
  hubClusterName?: string,
): string | undefined => {
  const escapeLabelValue = (v: string): string => v.replaceAll('\\', '\\\\').replaceAll('"', '\\"');

  // Add cluster filter only for non-hub clusters (per useFleetPrometheusPoll documentation)
  const clusterFilter =
    cluster && cluster.trim() !== '' && cluster !== hubClusterName
      ? `cluster="${escapeLabelValue(cluster)}"`
      : '';
  const namespaceFilter =
    namespace !== ALL_NAMESPACES_SESSION_KEY ? `namespace="${escapeLabelValue(namespace)}"` : '';

  if (namespace === ALL_NAMESPACES_SESSION_KEY) {
    return metricQueriesForAllNamespaces[metric]?.(clusterFilter);
  }

  const filters = [namespaceFilter, clusterFilter]
    .filter((filter) => Boolean(filter?.trim()))
    .join(',');
  return metricQueriesForNamespace?.[metric]?.(filters);
};
