import { useMemo } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useIsACMPage from '@kubevirt-utils/hooks/useIsACMPage';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';
import { useFleetPrometheusPoll, useHubClusterName } from '@stolostron/multicluster-sdk';

import { getCpuText, getMemoryCapacityText, getMetricText } from '../utils/processVMTotalsMetrics';
import { getVMTotalsQueries, VMTotalsQueries } from '../utils/totalsQueries';

const useVMTotalsMetrics = (vms: V1VirtualMachine[], vmis: V1VirtualMachineInstance[]) => {
  const { cluster, ns: namespace } = useParams<{ cluster?: string; ns?: string }>();

  const [hubClusterName] = useHubClusterName();
  const isACMPage = useIsACMPage();

  const allClusters = isACMPage && isEmpty(cluster);

  const currentTime = useMemo<number>(() => Date.now(), []);

  const namespacesList = useMemo(() => [...new Set(vms.map((vm) => getNamespace(vm)))], [vms]);

  const queries = useMemo(
    () =>
      getVMTotalsQueries(
        namespace,
        namespacesList,
        cluster === hubClusterName ? undefined : cluster,
        allClusters,
      ),
    [namespace, namespacesList, cluster, hubClusterName, allClusters],
  );

  const prometheusPollProps = {
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
