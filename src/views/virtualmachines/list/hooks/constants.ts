import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

export const TEXT_FILTER_NAME_ID = 'name';
export const TEXT_FILTER_LABELS_ID = 'labels';

export const DEFAULT_DURATION = '15m';

export const VMListQueries = {
  CPU_USAGE: 'CPU_USAGE',
  MEMORY_USAGE: 'MEMORY_USAGE',
  NETWORK_TOTAL_USAGE: 'NETWORK_TOTAL_USAGE',
};

export const getVMListQueries = (namespace: string) => {
  const namespaceFilter =
    namespace === ALL_NAMESPACES_SESSION_KEY ? '' : `namespace='${namespace}'`;

  return {
    [VMListQueries.CPU_USAGE]: `sum(rate(kubevirt_vmi_cpu_usage_seconds_total{${namespaceFilter}}[${DEFAULT_DURATION}])) BY (name, namespace)`,
    [VMListQueries.MEMORY_USAGE]: `sum(kubevirt_vmi_memory_used_bytes{${namespaceFilter}}) BY (name, namespace)`,
    [VMListQueries.NETWORK_TOTAL_USAGE]: `sum(rate(kubevirt_vmi_network_transmit_bytes_total{${namespaceFilter}}[${DEFAULT_DURATION}]) + rate(kubevirt_vmi_network_receive_bytes_total{${namespaceFilter}}[${DEFAULT_DURATION}])) BY (name, namespace)`,
  };
};
