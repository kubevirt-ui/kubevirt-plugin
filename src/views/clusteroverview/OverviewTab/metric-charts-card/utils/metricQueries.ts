import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

import { METRICS } from './constants';

const metricQueriesForNamespace = {
  [METRICS.MEMORY]: (filters: string) =>
    `sum by (namespace)(kubevirt_vmi_memory_used_bytes{${filters}})`,
  [METRICS.RUNNING_VMS]: (filters: string) =>
    `sum by (namespace)(count by (name,namespace)(kubevirt_vmi_memory_used_bytes{${filters}}))`,
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
  [METRICS.RUNNING_VMS]: (clusterFilter: string) =>
    `count(count by (name,namespace)(kubevirt_vmi_memory_used_bytes${
      clusterFilter ? `{${clusterFilter}}` : ''
    }))`,
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

/** Per-cluster queries – return one time-series per cluster (group by cluster). */
const perClusterQueries: Record<string, (clusterFilter: string) => string> = {
  [METRICS.MEMORY]: (f) => `sum by (cluster)(kubevirt_vmi_memory_used_bytes${f})`,
  [METRICS.RUNNING_VMS]: (f) =>
    `count by (cluster)(count by (name,namespace,cluster)(kubevirt_vmi_memory_used_bytes${f}))`,
  [METRICS.STORAGE]: (f) =>
    `sum by (cluster)(max by (namespace, name, disk_name, cluster)(kubevirt_vmi_filesystem_used_bytes${f}))`,
  [METRICS.VCPU_USAGE]: (f) => `count by (cluster)(kubevirt_vmi_vcpu_wait_seconds_total${f})`,
  [METRICS.VM]: (f) =>
    `count by (cluster)(count by (name,namespace,cluster)(kubevirt_vm_error_status_last_transition_timestamp_seconds${f} + kubevirt_vm_migrating_status_last_transition_timestamp_seconds${f} + kubevirt_vm_non_running_status_last_transition_timestamp_seconds${f} + kubevirt_vm_running_status_last_transition_timestamp_seconds${f} + kubevirt_vm_starting_status_last_transition_timestamp_seconds${f}))`,
};

/** Wraps a per-cluster query with `topk(n, ...)` for instant ranking. */
export const getTopClusterRankingQuery = (metric: string, n: number): string | undefined => {
  const base = perClusterQueries[metric]?.('');
  return base ? `topk(${n}, ${base})` : undefined;
};

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Returns a per-cluster query filtered to only the given cluster names. */
export const getFilteredPerClusterQuery = (
  metric: string,
  clusterNames: string[],
): string | undefined => {
  const queryFn = perClusterQueries[metric];
  if (!queryFn || clusterNames.length === 0) return undefined;
  const regex = clusterNames.map(escapeRegex).join('|');
  return queryFn(`{cluster=~"${regex}"}`);
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
