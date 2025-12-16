import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { escapePromLabelValue } from '@kubevirt-utils/utils/prometheus';

import { TopConsumerMetric as Metric } from './topConsumerMetric';
import { TopConsumerScope as Scope } from './topConsumerScope';

const getNamespaceFilter = (namespace: string, clusterFilter: string): string => {
  const namespacePart =
    namespace && namespace !== ALL_NAMESPACES_SESSION_KEY
      ? `namespace="${escapePromLabelValue(namespace)}"`
      : '';
  const filters = [namespacePart, clusterFilter]
    .filter((filter) => Boolean(filter?.trim()))
    .join(',');
  return filters ? `{${filters}}` : '';
};

const topConsumerQueries = {
  [Scope.NODE.getValue()]: {
    [Metric.CPU.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_cpu_usage_seconds_total${namespaceFilter}[${duration}])) by (node))) > 0`,
    [Metric.MEMORY_SWAP_TRAFFIC.getValue()]: (numItemsToShow, _duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(kubevirt_vmi_memory_swap_in_traffic_bytes${namespaceFilter} + kubevirt_vmi_memory_swap_out_traffic_bytes${namespaceFilter}) by (node))) > 0`,
    [Metric.MEMORY.getValue()]: (numItemsToShow, _duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(kubevirt_vmi_memory_used_bytes${namespaceFilter}) by(node))) > 0`,
    [Metric.STORAGE_IOPS.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_iops_read_total${namespaceFilter}[${duration}]) + rate(kubevirt_vmi_storage_iops_write_total${namespaceFilter}[${duration}])) by (node))) > 0`,
    [Metric.STORAGE_READ_LATENCY.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum by (node)(rate(kubevirt_vmi_storage_read_times_seconds_total${namespaceFilter}[${duration}]) / sum by (node)(rate(kubevirt_vmi_storage_iops_read_total${namespaceFilter}[${duration}]) > 0))))`,
    [Metric.STORAGE_THROUGHPUT.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total${namespaceFilter}[${duration}]) + rate(kubevirt_vmi_storage_write_traffic_bytes_total${namespaceFilter}[${duration}])) by (node))) > 0`,
    [Metric.STORAGE_WRITE_LATENCY.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum by (node)(rate(kubevirt_vmi_storage_write_times_seconds_total${namespaceFilter}[${duration}]) / sum by (node)(rate(kubevirt_vmi_storage_iops_write_total${namespaceFilter}[${duration}]) > 0))))`,
    [Metric.VCPU_WAIT.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_vcpu_wait_seconds_total${namespaceFilter}[${duration}])) by (node))) > 0`,
  },
  [Scope.PROJECT.getValue()]: {
    [Metric.CPU.getValue()]: (numItemsToShow, duration, clusterFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_cpu_usage_seconds_total${clusterFilter}[${duration}])) by (namespace))) > 0`,
    [Metric.MEMORY_SWAP_TRAFFIC.getValue()]: (numItemsToShow, _duration, clusterFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(kubevirt_vmi_memory_swap_in_traffic_bytes${clusterFilter} + kubevirt_vmi_memory_swap_out_traffic_bytes${clusterFilter}) by (namespace))) > 0`,
    [Metric.MEMORY.getValue()]: (numItemsToShow, _duration, clusterFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(kubevirt_vmi_memory_used_bytes${clusterFilter}) by (namespace))) > 0`,
    [Metric.STORAGE_IOPS.getValue()]: (numItemsToShow, duration, clusterFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_iops_read_total${clusterFilter}[${duration}]) + rate(kubevirt_vmi_storage_iops_write_total${clusterFilter}[${duration}])) by (namespace))) > 0`,
    [Metric.STORAGE_READ_LATENCY.getValue()]: (numItemsToShow, duration, clusterFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum by (namespace)(rate(kubevirt_vmi_storage_read_times_seconds_total${clusterFilter}[${duration}]) / sum by (namespace)(rate(kubevirt_vmi_storage_iops_read_total${clusterFilter}[${duration}]) > 0))))`,
    [Metric.STORAGE_THROUGHPUT.getValue()]: (numItemsToShow, duration, clusterFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total${clusterFilter}[${duration}]) + rate(kubevirt_vmi_storage_write_traffic_bytes_total${clusterFilter}[${duration}])) by (namespace))) > 0`,
    [Metric.STORAGE_WRITE_LATENCY.getValue()]: (numItemsToShow, duration, clusterFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum by (namespace)(rate(kubevirt_vmi_storage_write_times_seconds_total${clusterFilter}[${duration}]) / sum by (namespace)(rate(kubevirt_vmi_storage_iops_write_total${clusterFilter}[${duration}]) > 0))))`,
    [Metric.VCPU_WAIT.getValue()]: (numItemsToShow, duration, clusterFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_vcpu_wait_seconds_total${clusterFilter}[${duration}])) by (namespace))) > 0`,
  },
  [Scope.VM.getValue()]: {
    [Metric.CPU.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_cpu_usage_seconds_total${namespaceFilter}[${duration}])) BY (name, namespace)))`,
    [Metric.MEMORY_SWAP_TRAFFIC.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk (${numItemsToShow}, sum(rate(kubevirt_vmi_memory_swap_in_traffic_bytes${namespaceFilter}[${duration}]) + rate(kubevirt_vmi_memory_swap_out_traffic_bytes${namespaceFilter}[${duration}]))by(name, namespace))) > 0`,
    [Metric.MEMORY.getValue()]: (numItemsToShow, _duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(kubevirt_vmi_memory_used_bytes${namespaceFilter}) by(name, namespace))) > 0`,
    [Metric.STORAGE_IOPS.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_iops_read_total${namespaceFilter}[${duration}]) + rate(kubevirt_vmi_storage_iops_write_total${namespaceFilter}[${duration}])) by (namespace, name))) > 0`,
    [Metric.STORAGE_READ_LATENCY.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, avg by (name, namespace)(rate(kubevirt_vmi_storage_read_times_seconds_total${namespaceFilter}[${duration}]) / rate(kubevirt_vmi_storage_iops_read_total${namespaceFilter}[${duration}]) > 0)))`,
    [Metric.STORAGE_THROUGHPUT.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total${namespaceFilter}[${duration}]) + rate(kubevirt_vmi_storage_write_traffic_bytes_total${namespaceFilter}[${duration}])) by (namespace, name))) > 0`,
    [Metric.STORAGE_WRITE_LATENCY.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, avg by (name, namespace)(rate(kubevirt_vmi_storage_write_times_seconds_total${namespaceFilter}[${duration}]) / rate(kubevirt_vmi_storage_iops_write_total${namespaceFilter}[${duration}]) > 0)))`,
    [Metric.VCPU_WAIT.getValue()]: (numItemsToShow, duration, namespaceFilter) =>
      `sort_desc(topk(${numItemsToShow}, sum(rate(kubevirt_vmi_vcpu_wait_seconds_total${namespaceFilter}[${duration}])) by (namespace, name))) > 0`,
  },
};

export const getTopConsumerQuery = (
  metric: string,
  scope: string,
  numItemsToShow = 5,
  duration = '5m',
  namespace?: string,
  cluster?: string,
  hubClusterName?: string,
): string | undefined => {
  // Add cluster filter only for non-hub clusters (per useFleetPrometheusPoll documentation)
  const trimmedCluster = typeof cluster === 'string' ? cluster.trim() : '';
  const clusterFilter =
    trimmedCluster !== '' && trimmedCluster !== hubClusterName
      ? `cluster="${escapePromLabelValue(trimmedCluster)}"`
      : '';
  const clusterFilterString = clusterFilter ? `{${clusterFilter}}` : '';
  const namespaceFilter = getNamespaceFilter(namespace || '', clusterFilter);

  // PROJECT scope aggregates by namespace, so it uses clusterFilter directly
  // NODE and VM scopes use namespaceFilter which includes both namespace and cluster
  return scope === Scope.PROJECT.getValue()
    ? topConsumerQueries?.[scope]?.[metric]?.(numItemsToShow, duration, clusterFilterString)
    : topConsumerQueries?.[scope]?.[metric]?.(numItemsToShow, duration, namespaceFilter);
};
