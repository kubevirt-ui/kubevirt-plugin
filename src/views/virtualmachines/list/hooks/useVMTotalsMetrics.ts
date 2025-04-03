import { useMemo } from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getMemory } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  PrometheusEndpoint,
  PrometheusResponse,
  useActiveNamespace,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';
import {
  findUnit,
  getHumanizedValue,
} from '@overview/OverviewTab/metric-charts-card/utils/hooks/utils';

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

  const getRawNumber = (response: PrometheusResponse) =>
    Number(response?.data?.result?.[0]?.value?.[1]);

  const getValueWithUnitText = (bytes: number, metric: string) => {
    const unit = findUnit(metric, bytes);
    const value = getHumanizedValue(metric, bytes, unit).toLocaleString();

    return `${value} ${unit}`;
  };

  const getCpuText = (response: PrometheusResponse) => {
    const value = getRawNumber(response);

    if (isNaN(value)) {
      return NO_DATA_DASH;
    }
    return `${value.toLocaleString()} m`;
  };

  const getMemoryCapacityText = () => {
    const bytes = vmis
      .map((vmi) => {
        const memorySize = getMemorySize(getMemory(vmi));
        return xbytes.parseSize(`${memorySize?.size} ${memorySize?.unit}B`);
      })
      .reduce((acc, cur) => acc + cur, 0);

    return getValueWithUnitText(bytes, METRICS.MEMORY);
  };

  const getMetricText = (response: PrometheusResponse, metric: string) => {
    const bytes = getRawNumber(response);
    return getValueWithUnitText(bytes, metric);
  };

  return {
    cpuRequested: getCpuText(cpuRequestedResponse),
    cpuUsage: getCpuText(cpuUsageResponse),
    memoryCapacity: getMemoryCapacityText(),
    memoryUsage: getMetricText(memoryUsageResponse, METRICS.MEMORY),
    storageCapacity: getMetricText(storageCapacityResponse, METRICS.STORAGE),
    storageUsage: getMetricText(storageUsageResponse, METRICS.STORAGE),
  };
};

export default useVMTotalsMetrics;
