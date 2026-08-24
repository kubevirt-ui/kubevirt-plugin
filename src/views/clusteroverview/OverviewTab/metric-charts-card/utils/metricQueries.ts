import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

import { METRICS } from './constants';

const buildFilterClause = (clusterFilter: string): string =>
  clusterFilter ? `{${clusterFilter}}` : '';

const metricQueriesForNamespace = {
  [METRICS.MEMORY]: (filters: string): string =>
    `sum by (namespace)(kubevirt_vmi_memory_used_bytes{${filters}})`,
  [METRICS.RUNNING_VMS]: (filters: string): string =>
    `sum by (namespace)(count by (name,namespace)(kubevirt_vmi_memory_used_bytes{${filters}}))`,
  [METRICS.STORAGE]: (filters: string): string =>
    `sum by (namespace)(max(kubevirt_vmi_filesystem_used_bytes{${filters}}) by (namespace, name, disk_name))`,
  [METRICS.VCPU_USAGE]: (filters: string): string =>
    `count(kubevirt_vmi_vcpu_wait_seconds_total{${filters}})`,
  [METRICS.VM]: (filters: string): string =>
    `sum by (namespace)(count by (name,namespace)(kubevirt_vm_error_status_last_transition_timestamp_seconds{${filters}} + kubevirt_vm_migrating_status_last_transition_timestamp_seconds{${filters}} + kubevirt_vm_non_running_status_last_transition_timestamp_seconds{${filters}} + kubevirt_vm_running_status_last_transition_timestamp_seconds{${filters}} + kubevirt_vm_starting_status_last_transition_timestamp_seconds{${filters}}))`,
};

const metricQueriesForAllNamespaces = {
  [METRICS.MEMORY]: (clusterFilter: string): string =>
    `sum(kubevirt_vmi_memory_used_bytes${buildFilterClause(clusterFilter)})`,
  [METRICS.RUNNING_VMS]: (clusterFilter: string): string =>
    `count(count by (name,namespace)(kubevirt_vmi_memory_used_bytes${buildFilterClause(clusterFilter)}))`,
  [METRICS.STORAGE]: (clusterFilter: string): string =>
    `sum(max(kubevirt_vmi_filesystem_used_bytes${buildFilterClause(clusterFilter)}) by (namespace, name, disk_name))`,
  [METRICS.VCPU_USAGE]: (clusterFilter: string): string =>
    `count(kubevirt_vmi_vcpu_wait_seconds_total${buildFilterClause(clusterFilter)})`,
  [METRICS.VM]: (clusterFilter: string): string => {
    const clause = buildFilterClause(clusterFilter);
    return `sum(count by (name,namespace)(kubevirt_vm_error_status_last_transition_timestamp_seconds${clause} + kubevirt_vm_migrating_status_last_transition_timestamp_seconds${clause} + kubevirt_vm_non_running_status_last_transition_timestamp_seconds${clause} + kubevirt_vm_running_status_last_transition_timestamp_seconds${clause} + kubevirt_vm_starting_status_last_transition_timestamp_seconds${clause}))`;
  },
};

/** Per-cluster queries – return one time-series per cluster (group by cluster). */
const perClusterQueries: Record<string, (clusterFilter: string) => string> = {
  [METRICS.MEMORY]: (fil) => `sum by (cluster)(kubevirt_vmi_memory_used_bytes${fil})`,
  [METRICS.RUNNING_VMS]: (fil) =>
    `count by (cluster)(count by (name,namespace,cluster)(kubevirt_vmi_memory_used_bytes${fil}))`,
  [METRICS.STORAGE]: (fil) =>
    `sum by (cluster)(max by (namespace, name, disk_name, cluster)(kubevirt_vmi_filesystem_used_bytes${fil}))`,
  [METRICS.VCPU_USAGE]: (fil) => `count by (cluster)(kubevirt_vmi_vcpu_wait_seconds_total${fil})`,
  [METRICS.VM]: (fil) =>
    `count by (cluster)(count by (name,namespace,cluster)(kubevirt_vm_error_status_last_transition_timestamp_seconds${fil} + kubevirt_vm_migrating_status_last_transition_timestamp_seconds${fil} + kubevirt_vm_non_running_status_last_transition_timestamp_seconds${fil} + kubevirt_vm_running_status_last_transition_timestamp_seconds${fil} + kubevirt_vm_starting_status_last_transition_timestamp_seconds${fil}))`,
};

/** Wraps a per-cluster query with `topk(n, ...)` for instant ranking. */
export const getTopClusterRankingQuery = (metric: string, num: number): string | undefined => {
  const base = perClusterQueries[metric]?.('');
  return base ? `topk(${num}, ${base})` : undefined;
};

const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Returns a per-cluster query filtered to only the given cluster names. */
export const getFilteredPerClusterQuery = (
  metric: string,
  clusterNames: string[],
): string | undefined => {
  const queryFn = perClusterQueries[metric];
  if (!queryFn || clusterNames.length === 0) {
    return undefined;
  }
  const regex = clusterNames.map(escapeRegex).join('|');
  return queryFn(`{cluster=~"${regex}"}`);
};

const buildVMNameFilter = (vmNames: string[]): string => {
  const regex = vmNames.map(escapeRegex).join('|');
  return `name=~"${regex}"`;
};

export const getMetricQuery = (
  metric: string,
  namespace: string,
  cluster?: string,
  hubClusterName?: string,
  vmNames?: string[],
): string | undefined => {
  if (vmNames?.length === 0) {
    return undefined;
  }

  const escapeLabelValue = (val: string): string =>
    val.replaceAll('\\', '\\\\').replaceAll('"', '\\"');

  const clusterFilter =
    cluster && cluster.trim() !== '' && cluster !== hubClusterName
      ? `cluster="${escapeLabelValue(cluster)}"`
      : '';
  const namespaceFilter =
    namespace !== ALL_NAMESPACES_SESSION_KEY ? `namespace="${escapeLabelValue(namespace)}"` : '';
  const vmNameFilter = vmNames?.length ? buildVMNameFilter(vmNames) : '';

  if (namespace === ALL_NAMESPACES_SESSION_KEY) {
    const filters = [clusterFilter, vmNameFilter].filter(Boolean).join(',');
    return metricQueriesForAllNamespaces[metric]?.(filters);
  }

  const filters = [namespaceFilter, clusterFilter, vmNameFilter]
    .filter((filter) => Boolean(filter?.trim()))
    .join(',');
  return metricQueriesForNamespace?.[metric]?.(filters);
};
