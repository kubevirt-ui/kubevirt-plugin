import { useMemo } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';

import { getCpuText, getMemoryCapacityText, getMetricText } from '../utils/processVMTotalsMetrics';
import { getVMTotalsQueries, VMTotalsQueries } from '../utils/totalsQueries';

const useVMTotalsMetrics = (vms: V1VirtualMachine[], vmis: V1VirtualMachineInstance[]) => {
  const namespace = useNamespaceParam();

  const cluster = useClusterParam();
  const isAllClustersPage = useIsAllClustersPage();

  const currentTime = useMemo<number>(() => Date.now(), []);

  const namespacesList = useMemo(() => [...new Set(vms.map((vm) => getNamespace(vm)))], [vms]);

  const queries = useMemo(
    () =>
      getVMTotalsQueries(
        namespace,
        namespacesList,
        isAllClustersPage ? undefined : cluster,
        isAllClustersPage,
      ),
    [namespace, namespacesList, cluster, isAllClustersPage],
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

  const [cpuRequestedResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMTotalsQueries.TOTAL_CPU_REQUESTED],
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
    cpuRequested: getCpuText(cpuRequestedResponse),
    cpuUsage: getCpuText(cpuUsageResponse),
    memoryCapacity: getMemoryCapacityText(vmis),
    memoryUsage: getMetricText(memoryUsageResponse, METRICS.MEMORY),
    storageCapacity: getMetricText(storageCapacityResponse, METRICS.STORAGE),
    storageUsage: getMetricText(storageUsageResponse, METRICS.STORAGE),
  };
};

export default useVMTotalsMetrics;
