import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';
import { MetricsDataByNode } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/hooks/useNodesMetrics/utils/types';
import { getDataByNode } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/hooks/useNodesMetrics/utils/utils';

type UseNodesMetrics = (cluster?: string) => {
  metricsData: MetricsDataByNode;
  metricsLoaded: boolean;
};

const useNodesMetrics: UseNodesMetrics = (cluster) => {
  const [usedMemoryResult, usedMemoryLoaded] = useFleetPrometheusPoll({
    cluster,
    endpoint: PrometheusEndpoint.QUERY,
    query: 'sum by (instance) (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)',
  });

  const [totalMemoryResult, totalMemoryLoaded] = useFleetPrometheusPoll({
    cluster,
    endpoint: PrometheusEndpoint.QUERY,
    query: 'sum by (instance) (node_memory_MemTotal_bytes)',
  });

  const [usedCPUResult, usedCPULoaded] = useFleetPrometheusPoll({
    cluster,
    endpoint: PrometheusEndpoint.QUERY,
    query: 'sum by(instance) (instance:node_cpu:rate:sum)',
  });

  const [totalCPUResult, totalCPULoaded] = useFleetPrometheusPoll({
    cluster,
    endpoint: PrometheusEndpoint.QUERY,
    query: 'sum by(instance) (instance:node_num_cpu:sum)',
  });

  const usedMemoryData = usedMemoryResult?.data?.result;
  const totalMemoryData = totalMemoryResult?.data?.result;
  const usedCPUData = usedCPUResult?.data?.result;
  const totalCPUData = totalCPUResult?.data?.result;

  const metricsLoaded = usedMemoryLoaded && totalMemoryLoaded && usedCPULoaded && totalCPULoaded;

  const metricsData = getDataByNode({
    totalCPU: totalCPUData || [],
    totalMemory: totalMemoryData || [],
    usedCPU: usedCPUData || [],
    usedMemory: usedMemoryData || [],
  });

  return { metricsData, metricsLoaded };
};

export default useNodesMetrics;
