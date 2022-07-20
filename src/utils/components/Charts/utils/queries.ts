export enum VMQueries {
  CPU_USAGE = 'CPU_USAGE',
  CPU_REQUESTED = 'CPU_REQUESTED',
  MEMORY_USAGE = 'MEMORY_USAGE',
  FILESYSTEM_USAGE = 'FILESYSTEM_USAGE',
  FILESYSTEM_READ_USAGE = 'FILESYSTEM_READ_USAGE',
  FILESYSTEM_WRITE_USAGE = 'FILESYSTEM_WRITE_USAGE',
  NETWORK_USAGE = 'NETWORK_USAGE',
  NETWORK_IN_USAGE = 'NETWORK_IN_USAGE',
  NETWORK_OUT_USAGE = 'NETWORK_OUT_USAGE',
}

const queries = {
  // We don't set namespace explicitly in the PromQL template because it is
  // being injected anyway by prom-label-proxy when we query Thanos.
  [VMQueries.CPU_USAGE]: (launcherPodName: string) =>
    // TODO verify; use seconds or milicores?
    // `kubevirt_vmi_vcpu_seconds{exported_namespace='<%= namespace %>',name='<%= vmName %>'}`,
    `pod:container_cpu_usage:sum{pod='${launcherPodName}'}`,
  [VMQueries.CPU_REQUESTED]: (launcherPodName: string) =>
    `sum(kube_pod_resource_request{resource='cpu',pod='${launcherPodName}'})`,
  [VMQueries.MEMORY_USAGE]: (vmName: string) =>
    `kubevirt_vmi_memory_resident_bytes{name='${vmName}'}`,
  [VMQueries.FILESYSTEM_READ_USAGE]: (vmName: string) =>
    `sum(kubevirt_vmi_storage_read_traffic_bytes_total{name='${vmName}'})`,
  [VMQueries.FILESYSTEM_WRITE_USAGE]: (vmName: string) =>
    `sum(kubevirt_vmi_storage_write_traffic_bytes_total{name='${vmName}'})`,
  [VMQueries.NETWORK_IN_USAGE]: (vmName: string) =>
    `sum(kubevirt_vmi_network_receive_bytes_total{name='${vmName}'})`,
  [VMQueries.NETWORK_OUT_USAGE]: (vmName: string) =>
    `sum(kubevirt_vmi_network_transmit_bytes_total{name='${vmName}'})`,
};

export enum PrometheusEndpoint {
  LABEL = 'api/v1/label',
  QUERY = 'api/v1/query',
  QUERY_RANGE = 'api/v1/query_range',
  RULES = 'api/v1/rules',
  TARGETS = 'api/v1/targets',
}

export const getUtilizationQueries = (props: { vmName: string; launcherPodName?: string }) => ({
  [VMQueries.CPU_USAGE]: queries[VMQueries.CPU_USAGE](props?.launcherPodName),
  [VMQueries.CPU_REQUESTED]: queries[VMQueries.CPU_REQUESTED](props?.launcherPodName),
  [VMQueries.MEMORY_USAGE]: queries[VMQueries.MEMORY_USAGE](props?.vmName),
});

export const getMultilineUtilizationQueries = (props: {
  vmName: string;
  launcherPodName?: string;
}) => ({
  [VMQueries.FILESYSTEM_USAGE]: [
    {
      query: queries[VMQueries.FILESYSTEM_READ_USAGE](props?.vmName),
      desc: 'read',
    },
    {
      query: queries[VMQueries.FILESYSTEM_WRITE_USAGE](props?.vmName),
      desc: 'write',
    },
  ],
  [VMQueries.NETWORK_USAGE]: [
    {
      query: queries[VMQueries.NETWORK_IN_USAGE](props?.vmName),
      desc: 'in',
    },
    {
      query: queries[VMQueries.NETWORK_OUT_USAGE](props?.vmName),
      desc: 'out',
    },
  ],
});
