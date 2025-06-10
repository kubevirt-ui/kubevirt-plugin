import { isEmpty } from '@kubevirt-utils/utils/utils';

export const TEXT_FILTER_NAME_ID = 'name';
export const TEXT_FILTER_LABELS_ID = 'labels';

export const VMListQueries = {
  CPU_REQUESTED: 'CPU_REQUESTED',
  CPU_USAGE: 'CPU_USAGE',
  MEMORY_USAGE: 'MEMORY_USAGE',
  NETWORK_TOTAL_USAGE: 'NETWORK_TOTAL_USAGE',
};

export const getVMListQueries = (namespace: string, cluster?: string) => {
  const namespaceFilter = isEmpty(namespace) ? '' : `namespace='${namespace}'`;

  const clusterFilter = cluster ? `cluster='${cluster}'` : '';

  const filters = [namespaceFilter, clusterFilter].filter((filter) => filter.length > 0).join(',');

  const duration = cluster ? '15m' : '30s';
  return {
    [VMListQueries.CPU_REQUESTED]: `kube_pod_resource_request{resource='cpu',${filters}}`,
    [VMListQueries.CPU_USAGE]: `rate(kubevirt_vmi_cpu_usage_seconds_total{${filters}}[${duration}])`,
    [VMListQueries.MEMORY_USAGE]: `kubevirt_vmi_memory_used_bytes{${filters}}`,
    [VMListQueries.NETWORK_TOTAL_USAGE]: `rate(kubevirt_vmi_network_transmit_bytes_total{${filters}}[${duration}]) + rate(kubevirt_vmi_network_receive_bytes_total{${filters}}[${duration}])`,
  };
};
