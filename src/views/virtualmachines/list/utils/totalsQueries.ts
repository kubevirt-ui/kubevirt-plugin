import { isEmpty } from '@kubevirt-utils/utils/utils';

export const VMTotalsQueries = {
  TOTAL_CPU_REQUESTED: 'TOTAL_CPU_REQUESTED',
  TOTAL_CPU_USAGE: 'TOTAL_CPU_USAGE',
  TOTAL_MEMORY_USAGE: 'TOTAL_MEMORY_USAGE',
  TOTAL_STORAGE_CAPACITY: 'TOTAL_STORAGE_CAPACITY',
  TOTAL_STORAGE_USAGE: 'TOTAL_STORAGE_USAGE',
};

const getSumBy = (isAllNamespaces: boolean, cluster?: string, allClusters = false) => {
  if (allClusters || isAllNamespaces) return 'sum';

  if (cluster) return 'sum by (namespace, cluster)';

  return 'sum by (namespace)';
};

export const getVMTotalsQueries = (
  namespace: string,
  namespacesList: string[],
  cluster?: string,
  allClusters = false,
) => {
  const isAllNamespaces = isEmpty(namespace);

  const clusterFilter = cluster ? `cluster='${cluster}'` : '';

  const filterByNamespace = isAllNamespaces
    ? `{${clusterFilter}}`
    : `{namespace='${namespace}',${clusterFilter}}`;

  const filterCpuRequestedByNamespace = isAllNamespaces
    ? `namespace=~'${namespacesList.join('|')}',${clusterFilter}`
    : `namespace='${namespace}',${clusterFilter}`;

  const duration = cluster || allClusters ? '15m' : '30s';
  const sumBy = getSumBy(isAllNamespaces, cluster, allClusters);

  return {
    [VMTotalsQueries.TOTAL_CPU_REQUESTED]: `${sumBy}(kube_pod_resource_request{resource='cpu',${filterCpuRequestedByNamespace}})`,
    [VMTotalsQueries.TOTAL_CPU_USAGE]: `${sumBy}(rate(kubevirt_vmi_cpu_usage_seconds_total${filterByNamespace}[${duration}]))`,
    [VMTotalsQueries.TOTAL_MEMORY_USAGE]: `${sumBy}(kubevirt_vmi_memory_available_bytes${filterByNamespace} - kubevirt_vmi_memory_usable_bytes${filterByNamespace})`,
    [VMTotalsQueries.TOTAL_STORAGE_CAPACITY]: `${sumBy}(max(kubevirt_vmi_filesystem_capacity_bytes${filterByNamespace}) by (namespace, name, disk_name, cluster))`,
    [VMTotalsQueries.TOTAL_STORAGE_USAGE]: `${sumBy}(max(kubevirt_vmi_filesystem_used_bytes${filterByNamespace}) by (namespace, name, disk_name, cluster))`,
  };
};
