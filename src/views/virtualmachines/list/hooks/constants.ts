import { isEmpty } from '@kubevirt-utils/utils/utils';

export const TEXT_FILTER_NAME_ID = 'name';
export const TEXT_FILTER_LABELS_ID = 'labels';

export const DEFAULT_DURATION = '15m';

export const VMListQueries = {
  CPU_USAGE: 'CPU_USAGE',
  MEMORY_USAGE: 'MEMORY_USAGE',
  NETWORK_TOTAL_USAGE: 'NETWORK_TOTAL_USAGE',
};

export const getVMListQueries = (namespace: string, cluster?: string) => {
  const namespaceFilter = isEmpty(namespace) ? '' : `namespace='${namespace}'`;

  const clusterFilter = cluster ? `cluster='${cluster}'` : '';

  const filters = [namespaceFilter, clusterFilter].filter((filter) => filter.length > 0).join(',');

  return {
    [VMListQueries.CPU_USAGE]: `sum(rate(kubevirt_vmi_cpu_usage_seconds_total{${filters}}[${DEFAULT_DURATION}])) BY (name, namespace, cluster)`,
    [VMListQueries.MEMORY_USAGE]: `sum(kubevirt_vmi_memory_used_bytes{${filters}}) BY (name, namespace, cluster)`,
    [VMListQueries.NETWORK_TOTAL_USAGE]: `sum(rate(kubevirt_vmi_network_transmit_bytes_total{${filters}}[${DEFAULT_DURATION}]) + rate(kubevirt_vmi_network_receive_bytes_total{${filters}}[${DEFAULT_DURATION}])) BY (name, namespace, cluster)`,
  };
};
