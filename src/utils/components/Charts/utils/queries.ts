import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

enum VMQueries {
  CPU_USAGE = 'CPU_USAGE',
  CPU_REQUESTED = 'CPU_REQUESTED',
  MEMORY_USAGE = 'MEMORY_USAGE',
  FILESYSTEM_READ_USAGE = 'FILESYSTEM_READ_USAGE',
  FILESYSTEM_WRITE_USAGE = 'FILESYSTEM_WRITE_USAGE',
  FILESYSTEM_USAGE_TOTAL = 'FILESYSTEM_TOTAL_USAGE',
  NETWORK_IN_USAGE = 'NETWORK_IN_USAGE',
  NETWORK_OUT_USAGE = 'NETWORK_OUT_USAGE',
  NETWORK_IN_BY_INTERFACE_USAGE = 'NETWORK_IN_BY_INTERFACE_USAGE',
  NETWORK_OUT_BY_INTERFACE_USAGE = 'NETWORK_OUT_BY_INTERFACE_USAGE',
  NETWORK_TOTAL_USAGE = 'NETWORK_TOTAL_USAGE',
  STORAGE_IOPS_TOTAL = 'STORAGE_IOPS_TOTAL',
  MIGRATION_DATA_PROCESSED = 'MIGRATION_DATA_PROCESSED',
  MIGRATION_DATA_REMAINING = 'MIGRATION_DATA_REMAINING',
  MIGRATION_MEMORY_DIRTY_RATE = 'MIGRATION_MEMORY_DIRTY_RATE',
  MIGRATION_DISK_TRANSFER_RATE = 'MIGRATION_DISK_TRANSFER_RATE',
}

type UtilizationQueriesArgs = {
  obj: K8sResourceCommon;
  duration: string;
  launcherPodName?: string;
  nic?: string;
};

type GetUtilizationQueries = ({ obj, duration, launcherPodName, nic }: UtilizationQueriesArgs) => {
  [key in VMQueries]: string;
};

export const getUtilizationQueries: GetUtilizationQueries = ({
  obj,
  duration,
  launcherPodName,
  nic,
}) => {
  const { name, namespace } = obj?.metadata || {};
  return {
    [VMQueries.CPU_USAGE]: `sum(rate(container_cpu_usage_seconds_total{pod='${launcherPodName}',namespace='${namespace}',container="compute"}[${duration}])) BY (pod, namespace)`,
    [VMQueries.CPU_REQUESTED]: `sum(kube_pod_resource_request{resource='cpu',pod='${launcherPodName}',namespace='${namespace}'}) BY (name, namespace)`,
    [VMQueries.MEMORY_USAGE]: `sum(kubevirt_vmi_memory_used_bytes{name='${name}',namespace='${namespace}'}) BY (name)`,
    [VMQueries.NETWORK_IN_USAGE]: `sum(rate(kubevirt_vmi_network_receive_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.NETWORK_OUT_USAGE]: `sum(rate(kubevirt_vmi_network_transmit_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.NETWORK_IN_BY_INTERFACE_USAGE]: `sum(rate(kubevirt_vmi_network_receive_bytes_total{name='${name}',namespace='${namespace}',interface='${nic}'}[${duration}])) BY (name, namespace, interface)`,
    [VMQueries.NETWORK_OUT_BY_INTERFACE_USAGE]: `sum(rate(kubevirt_vmi_network_transmit_bytes_total{name='${name}',namespace='${namespace}',interface='${nic}'}[${duration}])) BY (name, namespace, interface)`,
    [VMQueries.NETWORK_TOTAL_USAGE]: `sum(rate(kubevirt_vmi_network_receive_bytes_total{name='${name}',namespace='${namespace}',interface='${nic}'}[${duration}]) + rate(kubevirt_vmi_network_transmit_bytes_total{name='${name}',namespace='${namespace}',interface='${nic}'}[${duration}])) BY (name, namespace, interface)`,
    [VMQueries.FILESYSTEM_READ_USAGE]: `sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.FILESYSTEM_WRITE_USAGE]: `sum(rate(kubevirt_vmi_storage_write_traffic_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.FILESYSTEM_USAGE_TOTAL]: `sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total{name='${name}',namespace='${namespace}'}[${duration}]) + rate(kubevirt_vmi_storage_write_traffic_bytes_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.STORAGE_IOPS_TOTAL]: `sum(rate(kubevirt_vmi_storage_iops_read_total{name='${name}',namespace='${namespace}'}[${duration}]) + rate(kubevirt_vmi_storage_iops_write_total{name='${name}',namespace='${namespace}'}[${duration}])) BY (name, namespace)`,
    [VMQueries.MIGRATION_DATA_PROCESSED]: `sum(sum_over_time(kubevirt_migrate_vmi_data_processed_bytes{name='${name}',namespace='${namespace}'}[${duration}]))  BY (name, namespace)`,
    [VMQueries.MIGRATION_DATA_REMAINING]: `sum(sum_over_time(kubevirt_migrate_vmi_data_remaining_bytes{name='${name}',namespace='${namespace}'}[${duration}]))  BY (name, namespace)`,
    [VMQueries.MIGRATION_MEMORY_DIRTY_RATE]: `sum(sum_over_time(kubevirt_migrate_vmi_dirty_memory_rate_bytes{name='${name}',namespace='${namespace}'}[${duration}]))  BY (name, namespace)`,
    [VMQueries.MIGRATION_DISK_TRANSFER_RATE]: `sum(sum_over_time(kubevirt_migrate_vmi_disk_transfer_rate_bytes{name='${name}',namespace='${namespace}'}[${duration}]))  BY (name, namespace)`,
  };
};
