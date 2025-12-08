import { useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import {
  PrometheusEndpoint,
  useActiveNamespace,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';

import {
  getCpuRequestedText,
  getCpuText,
  getMemoryCapacityText,
  getMetricText,
} from '../utils/processVMTotalsMetrics';
import { getVMTotalsQueries, VMTotalsQueries } from '../utils/totalsQueries';

const useVMTotalsMetrics = (vmis: V1VirtualMachineInstance[]) => {
  const [activeNamespace] = useActiveNamespace();
  const allNamespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY;
  const currentTime = useMemo<number>(() => Date.now(), []);

  const queries = useMemo(() => getVMTotalsQueries(activeNamespace), [activeNamespace]);

  const prometheusPollProps = {
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: allNamespace ? undefined : activeNamespace,
  };

  const [cpuUsageResponse] = usePrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMTotalsQueries.TOTAL_CPU_USAGE],
  });

  const [memoryUsageResponse] = usePrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMTotalsQueries.TOTAL_MEMORY_USAGE],
  });

  const [storageUsageResponse] = usePrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMTotalsQueries.TOTAL_STORAGE_USAGE],
  });

  const [storageCapacityResponse] = usePrometheusPoll({
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
