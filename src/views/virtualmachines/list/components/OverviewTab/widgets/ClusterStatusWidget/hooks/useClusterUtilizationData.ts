import useClusterParam from '@multicluster/hooks/useClusterParam';
import { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

import { pct } from './clusterMetricUtils';
import useResourceUtilizationPolls from './useResourceUtilizationPolls';

type ClusterUtilizationData = {
  cpuLoad: number;
  loaded: boolean;
  memoryLoad: number;
  storageLoad: number;
};

const getPercentageFromPrometheusResult = (
  usedResult: PrometheusResponse,
  totalResult: PrometheusResponse,
): number => {
  const used = Number(usedResult?.data?.result?.[0]?.value?.[1] ?? 0);
  const total = Number(totalResult?.data?.result?.[0]?.value?.[1] ?? 0);
  return Math.round(pct(used, total));
};

const useClusterUtilizationData = (): ClusterUtilizationData => {
  const cluster = useClusterParam();
  const { loaded, totalCPU, totalMemory, totalStorage, usedCPU, usedMemory, usedStorage } =
    useResourceUtilizationPolls({ cluster });

  const cpuLoad = getPercentageFromPrometheusResult(usedCPU, totalCPU);
  const memoryLoad = getPercentageFromPrometheusResult(usedMemory, totalMemory);
  const storageLoad = getPercentageFromPrometheusResult(usedStorage, totalStorage);

  return { cpuLoad, loaded, memoryLoad, storageLoad };
};

export default useClusterUtilizationData;
