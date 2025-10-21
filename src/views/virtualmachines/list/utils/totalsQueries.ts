import { isEmpty } from '@kubevirt-utils/utils/utils';

export const VMTotalsQueries = {
  TOTAL_CPU_REQUESTED: 'TOTAL_CPU_REQUESTED',
  TOTAL_CPU_USAGE: 'TOTAL_CPU_USAGE',
  TOTAL_MEMORY_USAGE: 'TOTAL_MEMORY_USAGE',
  TOTAL_STORAGE_CAPACITY: 'TOTAL_STORAGE_CAPACITY',
  TOTAL_STORAGE_USAGE: 'TOTAL_STORAGE_USAGE',
};

export const getVMTotalsQueries = (
  namespaces: string[],
  clusters?: string[],
  allClusters = false,
) => {
  const isAllNamespaces = isEmpty(namespaces);

  const clusterFilter = isEmpty(clusters) ? '' : `cluster=~'${clusters.join('|')}'`;

  const filters = isAllNamespaces
    ? `{${clusterFilter}}`
    : `{namespace=~'${namespaces.join('|')}',${clusterFilter}}`;

  const duration = clusters || allClusters ? '15m' : '30s';

  return {
    [VMTotalsQueries.TOTAL_CPU_USAGE]: `sum(rate(kubevirt_vmi_cpu_usage_seconds_total${filters}[${duration}]))`,
    [VMTotalsQueries.TOTAL_MEMORY_USAGE]: `sum(kubevirt_vmi_memory_used_bytes${filters})`,
    [VMTotalsQueries.TOTAL_STORAGE_CAPACITY]: `sum(max(kubevirt_vmi_filesystem_capacity_bytes${filters}) by (namespace, name, disk_name, cluster))`,
    [VMTotalsQueries.TOTAL_STORAGE_USAGE]: `sum(max(kubevirt_vmi_filesystem_used_bytes${filters}) by (namespace, name, disk_name, cluster))`,
  };
};
