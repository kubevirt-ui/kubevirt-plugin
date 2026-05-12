import { useEffect, useMemo } from 'react';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import {
  PrometheusEndpoint,
  useActiveNamespace,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

import { setVMCPUUsage, setVMMemoryUsage, setVMNetworkUsage } from '../metrics';

import { getVMListQueries, VMListQueries } from './constants';

const useVMMetrics = () => {
  const [activeNamespace] = useActiveNamespace();
  const allNamespace = useMemo(
    () => activeNamespace === ALL_NAMESPACES_SESSION_KEY,
    [activeNamespace],
  );
  const currentTime = useMemo<number>(() => Date.now(), []);

  const queries = useMemo(() => getVMListQueries(activeNamespace), [activeNamespace]);

  const [memoryUsageResponse] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: allNamespace ? undefined : activeNamespace,
    query: queries?.[VMListQueries.MEMORY_USAGE],
  });

  const [networkTotalResponse] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: allNamespace ? undefined : activeNamespace,
    query: queries?.NETWORK_TOTAL_USAGE,
  });

  const [cpuUsageResponse] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: allNamespace ? undefined : activeNamespace,
    query: queries?.[VMListQueries.CPU_USAGE],
  });

  useEffect(() => {
    networkTotalResponse?.data?.result?.forEach((result) => {
      const vmName = result?.metric?.name;
      const vmNamespace = result?.metric?.namespace;
      const memoryUsage = parseFloat(result?.value?.[1]);

      setVMNetworkUsage(vmName, vmNamespace, memoryUsage);
    });
  }, [networkTotalResponse]);

  useEffect(() => {
    memoryUsageResponse?.data?.result?.forEach((result) => {
      const vmName = result?.metric?.name;
      const vmNamespace = result?.metric?.namespace;
      const memoryUsage = parseFloat(result?.value?.[1]);

      setVMMemoryUsage(vmName, vmNamespace, memoryUsage);
    });
  }, [memoryUsageResponse]);

  useEffect(() => {
    cpuUsageResponse?.data?.result?.forEach((result) => {
      const vmName = result?.metric?.name;
      const vmNamespace = result?.metric?.namespace;
      const cpuUsage = parseFloat(result?.value?.[1]);

      setVMCPUUsage(vmName, vmNamespace, cpuUsage);
    });
  }, [cpuUsageResponse]);
};

export default useVMMetrics;
