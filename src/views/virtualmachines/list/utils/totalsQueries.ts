import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

export const VMTotalsQueries = {
  TOTAL_CPU_USAGE: 'TOTAL_CPU_USAGE',
  TOTAL_MEMORY_USAGE: 'TOTAL_MEMORY_USAGE',
  TOTAL_STORAGE_CAPACITY: 'TOTAL_STORAGE_CAPACITY',
  TOTAL_STORAGE_USAGE: 'TOTAL_STORAGE_USAGE',
};

export const getVMTotalsQueries = (namespace: string) => {
  const isAllNamespaces = namespace === ALL_NAMESPACES_SESSION_KEY;

  const sumByNamespace = isAllNamespaces ? 'sum' : 'sum by (namespace)';
  const filterByNamespace = isAllNamespaces ? '' : `{namespace='${namespace}'}`;

  return {
    [VMTotalsQueries.TOTAL_CPU_USAGE]: `${sumByNamespace}(rate(kubevirt_vmi_cpu_usage_seconds_total${filterByNamespace}[30s]))`,
    [VMTotalsQueries.TOTAL_MEMORY_USAGE]: `${sumByNamespace}(kubevirt_vmi_memory_used_bytes${filterByNamespace})`,
    [VMTotalsQueries.TOTAL_STORAGE_CAPACITY]: `${sumByNamespace}(max(kubevirt_vmi_filesystem_capacity_bytes${filterByNamespace}) by (namespace, name, disk_name))`,
    [VMTotalsQueries.TOTAL_STORAGE_USAGE]: `${sumByNamespace}(max(kubevirt_vmi_filesystem_used_bytes${filterByNamespace}) by (namespace, name, disk_name))`,
  };
};
