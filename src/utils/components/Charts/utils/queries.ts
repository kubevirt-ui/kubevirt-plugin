import { isEmpty } from '@kubevirt-utils/utils/utils';

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
  hubClusterName?: string;
  launcherPodName?: string;
  nic?: string;
  obj: K8sResourceCommon;
};

type GetUtilizationQueries = ({
  duration,
  hubClusterName,
  launcherPodName,
  nic,
  obj,
}: UtilizationQueriesArgs) => {
  [key in VMQueries]: string;
};

export const getUtilizationQueries: GetUtilizationQueries = ({
  duration,
  hubClusterName,
  launcherPodName,
  obj,
}) => {
  const { name, namespace } = obj?.metadata || {};

  const clusterFilter =
    !isEmpty(obj?.cluster) && obj?.cluster === hubClusterName ? `,cluster='${obj.cluster}'` : '';

  const sumByCluster = !isEmpty(obj?.cluster) && obj?.cluster === hubClusterName ? ', cluster' : '';
  return {
    [VMQueries.CPU_REQUESTED]: `sum(kube_pod_resource_request{resource='cpu'${clusterFilter},pod='${launcherPodName}',namespace='${namespace}'}) BY (name, namespace${sumByCluster})`,
    [VMQueries.CPU_USAGE]: `sum(rate(kubevirt_vmi_cpu_usage_seconds_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])) BY (name, namespace${sumByCluster})`,
    [VMQueries.FILESYSTEM_READ_USAGE]: `sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])) BY (name, namespace${sumByCluster})`,
    [VMQueries.FILESYSTEM_USAGE_TOTAL]: `sum(rate(kubevirt_vmi_storage_read_traffic_bytes_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}]) + rate(kubevirt_vmi_storage_write_traffic_bytes_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])) BY (name, namespace${sumByCluster})`,
    [VMQueries.FILESYSTEM_WRITE_USAGE]: `sum(rate(kubevirt_vmi_storage_write_traffic_bytes_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])) BY (name, namespace${sumByCluster})`,
    [VMQueries.INSTANT_MIGRATION_DATA_PROCESSED]: `kubevirt_vmi_migration_data_processed_bytes{name='${name}',namespace='${namespace}'${clusterFilter}}`,
    [VMQueries.INSTANT_MIGRATION_DATA_REMAINING]: `kubevirt_vmi_migration_data_remaining_bytes{name='${name}',namespace='${namespace}'${clusterFilter}}`,
    [VMQueries.MEMORY_USAGE]: `last_over_time(kubevirt_vmi_memory_used_bytes{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])`,
    [VMQueries.MIGRATION_DATA_PROCESSED]: `sum(sum_over_time(kubevirt_vmi_migration_data_processed_bytes{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}]))  BY (name, namespace${sumByCluster})`,
    [VMQueries.MIGRATION_DATA_REMAINING]: `sum(sum_over_time(kubevirt_vmi_migration_data_remaining_bytes{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}]))  BY (name, namespace${sumByCluster})`,
    [VMQueries.MIGRATION_DISK_TRANSFER_RATE]: `sum(sum_over_time(kubevirt_vmi_migration_disk_transfer_rate_bytes	{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}]))  BY (name, namespace${sumByCluster})`,
    [VMQueries.MIGRATION_MEMORY_DIRTY_RATE]: `sum(sum_over_time(kubevirt_vmi_migration_dirty_memory_rate_bytes{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}]))  BY (name, namespace${sumByCluster})`,
    [VMQueries.NETWORK_IN_BY_INTERFACE_USAGE]: `sum(rate(kubevirt_vmi_network_receive_bytes_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])) BY (name, namespace${sumByCluster}, interface)`,
    [VMQueries.NETWORK_IN_USAGE]: `sum(rate(kubevirt_vmi_network_receive_bytes_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])) BY (name, namespace${sumByCluster})`,
    [VMQueries.NETWORK_OUT_BY_INTERFACE_USAGE]: `sum(rate(kubevirt_vmi_network_transmit_bytes_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])) BY (name, namespace${sumByCluster}, interface)`,
    [VMQueries.NETWORK_OUT_USAGE]: `sum(rate(kubevirt_vmi_network_transmit_bytes_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])) BY (name, namespace${sumByCluster})`,
    [VMQueries.NETWORK_TOTAL_BY_INTERFACE_USAGE]: `sum(rate(kubevirt_vmi_network_receive_bytes_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])) BY (name, namespace${sumByCluster}, interface)`,
    [VMQueries.NETWORK_TOTAL_USAGE]: `sum(rate(kubevirt_vmi_network_receive_bytes_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])) BY (name, namespace${sumByCluster})`,
    [VMQueries.STORAGE_IOPS_TOTAL]: `sum(rate(kubevirt_vmi_storage_iops_read_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}]) + rate(kubevirt_vmi_storage_iops_write_total{name='${name}',namespace='${namespace}'${clusterFilter}}[${duration}])) BY (name, namespace${sumByCluster})`,
  };
};
