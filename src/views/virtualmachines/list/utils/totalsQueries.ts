import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

export const VMTotalsQueries = {
  TOTAL_CPU_REQUESTED: 'TOTAL_CPU_REQUESTED',
  TOTAL_CPU_USAGE: 'TOTAL_CPU_USAGE',
  TOTAL_MEMORY_USAGE: 'TOTAL_MEMORY_USAGE',
  TOTAL_STORAGE_CAPACITY: 'TOTAL_STORAGE_CAPACITY',
  TOTAL_STORAGE_USAGE: 'TOTAL_STORAGE_USAGE',
};

export const getVMTotalsQueries = (namespace: string, namespacesList: string[]) => {
  const isAllNamespaces = namespace === ALL_NAMESPACES_SESSION_KEY;

  const byNamespace = isAllNamespaces ? '' : ' by (namespace)';
  const namespaceFilter = isAllNamespaces ? '' : `{namespace='${namespace}'}`;
  const namespaceFilterCpu = isAllNamespaces
    ? `namespace=~'${namespacesList.join('|')}'`
    : `namespace='${namespace}'`;

  return {
    [VMTotalsQueries.TOTAL_CPU_REQUESTED]: `sum${byNamespace}(kube_pod_resource_request{resource='cpu',${namespaceFilterCpu}})`,
    [VMTotalsQueries.TOTAL_CPU_USAGE]: `sum${byNamespace}(rate(kubevirt_vmi_cpu_usage_seconds_total${namespaceFilter}[5m]))`,
    [VMTotalsQueries.TOTAL_MEMORY_USAGE]: `sum${byNamespace}(kubevirt_vmi_memory_available_bytes${namespaceFilter} - kubevirt_vmi_memory_usable_bytes${namespaceFilter})`,
    [VMTotalsQueries.TOTAL_STORAGE_CAPACITY]: `sum${byNamespace}(max(kubevirt_vmi_filesystem_capacity_bytes${namespaceFilter}) by (namespace, name, disk_name))`,
    [VMTotalsQueries.TOTAL_STORAGE_USAGE]: `sum${byNamespace}(max(kubevirt_vmi_filesystem_used_bytes${namespaceFilter}) by (namespace, name, disk_name))`,
  };
};
