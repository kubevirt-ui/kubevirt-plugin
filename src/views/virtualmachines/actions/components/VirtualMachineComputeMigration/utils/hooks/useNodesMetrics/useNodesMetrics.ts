import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { MetricsDataByNode } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/hooks/useNodesMetrics/utils/types';
import { getDataByNode } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/hooks/useNodesMetrics/utils/utils';

type UseNodesMetrics = () => { metricsData: MetricsDataByNode; metricsLoaded: boolean };

const useNodesMetrics: UseNodesMetrics = () => {
  const [usedMemoryResult, usedMemoryLoaded] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: 'sum by (instance) (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)',
  });

  const [totalMemoryResult, totalMemoryLoaded] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: 'sum by (instance) (node_memory_MemTotal_bytes)',
  });

  const [usedCPUResult, usedCPULoaded] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: 'sum by(instance) (instance:node_cpu:rate:sum)',
  });

  const [totalCPUResult, totalCPULoaded] = usePrometheusPoll({
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
