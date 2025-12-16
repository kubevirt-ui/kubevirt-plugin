import { useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useListNamespaces from '@kubevirt-utils/hooks/useListNamespaces';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';

import {
  getCpuRequestedText,
  getCpuText,
  getMemoryCapacityText,
  getMetricText,
} from '../utils/processVMTotalsMetrics';
import { getVMTotalsQueries, VMTotalsQueries } from '../utils/totalsQueries';

const useVMTotalsMetrics = (vmis: V1VirtualMachineInstance[]) => {
  const cluster = useClusterParam();
  const namespace = useNamespaceParam();
  const clusters = useListClusters();
  const namespaces = useListNamespaces();

  const isAllClustersPage = useIsAllClustersPage();

  const currentTime = useMemo<number>(() => Date.now(), []);

  const queries = useMemo(
    () => getVMTotalsQueries(namespaces, clusters, isAllClustersPage),
    [namespaces, clusters, isAllClustersPage],
  );

  const prometheusPollProps = {
    allClusters: isAllClustersPage,
    cluster,
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace,
  };

  const [cpuUsageResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMTotalsQueries.TOTAL_CPU_USAGE],
  });

  const [memoryUsageResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMTotalsQueries.TOTAL_MEMORY_USAGE],
  });

  const [storageUsageResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMTotalsQueries.TOTAL_STORAGE_USAGE],
  });

  const [storageCapacityResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMTotalsQueries.TOTAL_STORAGE_CAPACITY],
  });

  return {
    cpuRequested: getCpuRequestedText(vmis),
    cpuUsage: getCpuText(cpuUsageResponse),
    memoryCapacity: getMemoryCapacityText(vmis),
    memoryUsage: getMetricText(memoryUsageResponse, METRICS.MEMORY),
    storageCapacity: getMetricText(storageCapacityResponse, METRICS.STORAGE),
    storageUsage: getMetricText(storageUsageResponse, METRICS.STORAGE),
  };
};

export default useVMTotalsMetrics;
