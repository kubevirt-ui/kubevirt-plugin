import { useEffect, useMemo } from 'react';

import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useVMListQueries from '@multicluster/hooks/useVMListQueries';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';

import { Metric, setMetricFromResponse } from '../metrics';

import { VMListQueries } from './constants';

const useVMMetrics = () => {
  const namespace = useNamespaceParam();
  const cluster = useClusterParam();
  const allClusters = useIsAllClustersPage();

  const currentTime = useMemo<number>(() => Date.now(), []);

  const queries = useVMListQueries();

  const prometheusPollProps = {
    allClusters,
    cluster,
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace,
  };

  const [memoryUsageResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMListQueries.MEMORY_USAGE],
  });

  const [networkTotalResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMListQueries.NETWORK_TOTAL_USAGE],
  });

  const [cpuUsageResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMListQueries.CPU_USAGE],
  });

  const [storageUsageResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMListQueries.STORAGE_USAGE],
  });

  const [storageCapacityResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMListQueries.STORAGE_CAPACITY],
  });

  useEffect(() => {
    setMetricFromResponse(networkTotalResponse, Metric.networkUsage);
  }, [networkTotalResponse]);

  useEffect(() => {
    setMetricFromResponse(memoryUsageResponse, Metric.memoryUsage);
  }, [memoryUsageResponse]);

  useEffect(() => {
    setMetricFromResponse(cpuUsageResponse, Metric.cpuUsage);
  }, [cpuUsageResponse]);

  useEffect(() => {
    setMetricFromResponse(storageUsageResponse, Metric.storageUsage);
  }, [storageUsageResponse]);

  useEffect(() => {
    setMetricFromResponse(storageCapacityResponse, Metric.storageCapacity);
  }, [storageCapacityResponse]);
};

export default useVMMetrics;
