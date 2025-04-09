import { useMemo } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import {
  PrometheusEndpoint,
  useActiveNamespace,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';

import { getCpuText, getMemoryCapacityText, getMetricText } from '../utils/processVMTotalsMetrics';
import { getVMTotalsQueries, VMTotalsQueries } from '../utils/totalsQueries';

const useVMTotalsMetrics = (vms: V1VirtualMachine[], vmis: V1VirtualMachineInstance[]) => {
  const [activeNamespace] = useActiveNamespace();
  const allNamespace = activeNamespace === ALL_NAMESPACES_SESSION_KEY;
  const currentTime = useMemo<number>(() => Date.now(), []);

  const namespacesList = useMemo(() => [...new Set(vms.map((vm) => getNamespace(vm)))], [vms]);

  const queries = useMemo(
    () => getVMTotalsQueries(activeNamespace, namespacesList),
    [activeNamespace, namespacesList],
  );

  const prometheusPollProps = {
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: allNamespace ? undefined : activeNamespace,
  };

  const [cpuUsageResponse] = usePrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMTotalsQueries.TOTAL_CPU_USAGE],
  });

  const [cpuRequestedResponse] = usePrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMTotalsQueries.TOTAL_CPU_REQUESTED],
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
    cpuRequested: getCpuText(cpuRequestedResponse),
    cpuUsage: getCpuText(cpuUsageResponse),
    memoryCapacity: getMemoryCapacityText(vmis),
    memoryUsage: getMetricText(memoryUsageResponse, METRICS.MEMORY),
    storageCapacity: getMetricText(storageCapacityResponse, METRICS.STORAGE),
    storageUsage: getMetricText(storageUsageResponse, METRICS.STORAGE),
  };
};

export default useVMTotalsMetrics;
