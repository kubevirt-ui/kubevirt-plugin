import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

export const TEXT_FILTER_NAME_ID = 'name';
export const TEXT_FILTER_LABELS_ID = 'labels';

export const VMListQueries = {
  CPU_REQUESTED: 'CPU_REQUESTED',
  CPU_USAGE: 'CPU_USAGE',
  MEMORY_REQUESTED: 'MEMORY_REQUESTED',
  MEMORY_USAGE: 'MEMORY_USAGE',
  NETWORK_TOTAL_USAGE: 'NETWORK_TOTAL_USAGE',
};

export const getVMListQueries = (namespace: string) => {
  const namespaceFilter =
    namespace === ALL_NAMESPACES_SESSION_KEY ? '' : `namespace='${namespace}'`;

  return {
    [VMListQueries.CPU_REQUESTED]: `kube_pod_resource_request{resource='cpu',${namespaceFilter}}`,
    [VMListQueries.CPU_USAGE]: `rate(kubevirt_vmi_cpu_usage_seconds_total{${namespaceFilter}}[5m])`,
    [VMListQueries.MEMORY_REQUESTED]: `kube_pod_resource_request{resource='memory',${namespaceFilter}}`,
    [VMListQueries.MEMORY_USAGE]: `kubevirt_vmi_memory_used_bytes{${namespaceFilter}}`,
    [VMListQueries.NETWORK_TOTAL_USAGE]: `rate(kubevirt_vmi_network_transmit_bytes_total{${namespaceFilter}}[5m]) + rate(kubevirt_vmi_network_receive_bytes_total{${namespaceFilter}}[5m])`,
  };
};
