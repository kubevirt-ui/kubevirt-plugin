import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

enum VMQueries {
  CPU_REQUESTED = 'CPU_REQUESTED',
  CPU_USAGE = 'CPU_USAGE',
  FILESYSTEM_READ_USAGE = 'FILESYSTEM_READ_USAGE',
  FILESYSTEM_USAGE_TOTAL = 'FILESYSTEM_TOTAL_USAGE',
  FILESYSTEM_WRITE_USAGE = 'FILESYSTEM_WRITE_USAGE',
  INSTANT_MIGRATION_DATA_PROCESSED = 'INSTANT_MIGRATION_DATA_PROCESSED',
  INSTANT_MIGRATION_DATA_REMAINING = 'INSTANT_MIGRATION_DATA_REMAINING',
  MEMORY_USAGE = 'MEMORY_USAGE',
  MIGRATION_DATA_PROCESSED = 'MIGRATION_DATA_PROCESSED',
  MIGRATION_DATA_REMAINING = 'MIGRATION_DATA_REMAINING',
  MIGRATION_DISK_TRANSFER_RATE = 'MIGRATION_DISK_TRANSFER_RATE',
  MIGRATION_MEMORY_DIRTY_RATE = 'MIGRATION_MEMORY_DIRTY_RATE',
  NETWORK_IN_BY_INTERFACE_USAGE = 'NETWORK_IN_BY_INTERFACE_USAGE',
  NETWORK_IN_USAGE = 'NETWORK_IN_USAGE',
  NETWORK_OUT_BY_INTERFACE_USAGE = 'NETWORK_OUT_BY_INTERFACE_USAGE',
  NETWORK_OUT_USAGE = 'NETWORK_OUT_USAGE',
  NETWORK_TOTAL_BY_INTERFACE_USAGE = 'NETWORK_TOTAL_BY_INTERFACE_USAGE',
  NETWORK_TOTAL_USAGE = 'NETWORK_TOTAL_USAGE',
  STORAGE_IOPS_TOTAL = 'STORAGE_IOPS_TOTAL',
}

type UtilizationQueriesArgs = {
  duration?: string;
  launcherPodName?: string;
  nic?: string;
  obj: K8sResourceCommon;
};

type GetUtilizationQueries = ({ duration, launcherPodName, nic, obj }: UtilizationQueriesArgs) => {
  [key in VMQueries]: string;
};

export const getUtilizationQueries: GetUtilizationQueries = ({
  duration,
  launcherPodName,
  obj,
}) => {
  const { name, namespace } = obj?.metadata || {};
  return {
    [VMQueries.CPU_REQUESTED]: `sum(kube_pod_resource_request{resource='cpu',pod='${launcherPodName}',namespace='${namespace}'}) BY (name, namespace)`,
    [VMQueries.CPU_USAGE]: `sum(rate(kubevirt_vmi_cpu_usage_seconds_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.FILESYSTEM_READ_USAGE]: `sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.FILESYSTEM_USAGE_TOTAL]: `sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total{name='${name}',namespace='${namespace}'}[${duration}]) + rate(kubevirt_vmi_storage_write_traffic_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.FILESYSTEM_WRITE_USAGE]: `sum(rate(kubevirt_vmi_storage_write_traffic_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.INSTANT_MIGRATION_DATA_PROCESSED]: `kubevirt_vmi_migration_data_processed_bytes{name='${name}',namespace='${namespace}'}`,
    [VMQueries.INSTANT_MIGRATION_DATA_REMAINING]: `kubevirt_vmi_migration_data_remaining_bytes{name='${name}',namespace='${namespace}'}`,
    [VMQueries.MEMORY_USAGE]: `last_over_time(kubevirt_vmi_memory_used_bytes{name='${name}',namespace='${namespace}'}[${duration}])`,
    [VMQueries.MIGRATION_DATA_PROCESSED]: `sum(rate(kubevirt_vmi_migration_data_processed_bytes{name='${name}',namespace='${namespace}'}[${duration}]))  BY (name, namespace)`,
    [VMQueries.MIGRATION_DATA_REMAINING]: `sum(rate(kubevirt_vmi_migration_data_remaining_bytes{name='${name}',namespace='${namespace}'}[${duration}]))  BY (name, namespace)`,
    [VMQueries.MIGRATION_DISK_TRANSFER_RATE]: `sum(sum_over_time(kubevirt_vmi_migration_disk_transfer_rate_bytes	{name='${name}',namespace='${namespace}'}[${duration}]))  BY (name, namespace)`,
    [VMQueries.MIGRATION_MEMORY_DIRTY_RATE]: `sum(rate(kubevirt_vmi_migration_dirty_memory_rate_bytes{name='${name}',namespace='${namespace}'}[${duration}]))  BY (name, namespace)`,
    [VMQueries.NETWORK_IN_BY_INTERFACE_USAGE]: `sum(rate(kubevirt_vmi_network_receive_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace, interface)`,
    [VMQueries.NETWORK_IN_USAGE]: `sum(rate(kubevirt_vmi_network_receive_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.NETWORK_OUT_BY_INTERFACE_USAGE]: `sum(rate(kubevirt_vmi_network_transmit_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace, interface)`,
    [VMQueries.NETWORK_OUT_USAGE]: `sum(rate(kubevirt_vmi_network_transmit_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.NETWORK_TOTAL_BY_INTERFACE_USAGE]: `sum(rate(kubevirt_vmi_network_receive_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace, interface)`,
    [VMQueries.NETWORK_TOTAL_USAGE]: `sum(rate(kubevirt_vmi_network_receive_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.STORAGE_IOPS_TOTAL]: `sum(rate(kubevirt_vmi_storage_iops_read_total{name='${name}',namespace='${namespace}'}[${duration}]) + rate(kubevirt_vmi_storage_iops_write_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
  };
};
