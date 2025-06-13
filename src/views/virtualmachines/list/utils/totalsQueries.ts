import { isEmpty } from '@kubevirt-utils/utils/utils';

export const VMTotalsQueries = {
  TOTAL_CPU_REQUESTED: 'TOTAL_CPU_REQUESTED',
  TOTAL_CPU_USAGE: 'TOTAL_CPU_USAGE',
  TOTAL_MEMORY_USAGE: 'TOTAL_MEMORY_USAGE',
  TOTAL_STORAGE_CAPACITY: 'TOTAL_STORAGE_CAPACITY',
  TOTAL_STORAGE_USAGE: 'TOTAL_STORAGE_USAGE',
};

export const getVMTotalsQueries = (
  namespace: string,
  namespacesList: string[],
  cluster?: string,
) => {
  const isAllNamespaces = isEmpty(namespace);

  const clusterFilter = cluster ? `cluster='${cluster}'` : '';

  const sumByNamespace = isAllNamespaces ? 'sum by (cluster)' : 'sum by (namespace, cluster)';
  const filterByNamespace = isAllNamespaces
    ? `{${clusterFilter}}`
    : `{namespace='${namespace}',${clusterFilter}}`;

  const filterCpuRequestedByNamespace = isAllNamespaces
    ? `namespace=~'${namespacesList.join('|')}',${clusterFilter}`
    : `namespace='${namespace}',${clusterFilter}`;

  const duration = cluster ? '15m' : '30s';

  return {
    [VMTotalsQueries.TOTAL_CPU_REQUESTED]: `${sumByNamespace}(kube_pod_resource_request{resource='cpu',${filterCpuRequestedByNamespace}})`,
    [VMTotalsQueries.TOTAL_CPU_USAGE]: `${sumByNamespace}(rate(kubevirt_vmi_cpu_usage_seconds_total${filterByNamespace}[${duration}]))`,
    [VMTotalsQueries.TOTAL_MEMORY_USAGE]: `${sumByNamespace}(kubevirt_vmi_memory_available_bytes${filterByNamespace} - kubevirt_vmi_memory_usable_bytes${filterByNamespace})`,
    [VMTotalsQueries.TOTAL_STORAGE_CAPACITY]: `${sumByNamespace}(max(kubevirt_vmi_filesystem_capacity_bytes${filterByNamespace}) by (namespace, name, disk_name, cluster))`,
    [VMTotalsQueries.TOTAL_STORAGE_USAGE]: `${sumByNamespace}(max(kubevirt_vmi_filesystem_used_bytes${filterByNamespace}) by (namespace, name, disk_name, cluster))`,
  };
};
