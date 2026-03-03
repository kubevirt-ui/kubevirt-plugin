import { PrometheusEndpoint, PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll, useHubClusterName } from '@stolostron/multicluster-sdk';

import {
  CPU_TOTAL_EXPR,
  CPU_USED_EXPR,
  MEMORY_TOTAL_EXPR,
  MEMORY_USED_EXPR,
  STORAGE_TOTAL_EXPR,
  STORAGE_USED_EXPR,
} from './clusterMetricConstants';
import { injectClusterFilter, wrapLabelReplace } from './clusterMetricUtils';

type FleetPollResult = PrometheusResponse;

export type ResourceUtilizationPollsResult = {
  loaded: boolean;
  totalCPU: FleetPollResult;
  totalMemory: FleetPollResult;
  totalStorage: FleetPollResult;
  usedCPU: FleetPollResult;
  usedMemory: FleetPollResult;
  usedStorage: FleetPollResult;
};

type UseResourceUtilizationPollsOptions = {
  allClusters?: boolean;
  cluster?: string;
  groupBy?: string;
};

const buildQuery = (baseExpr: string, groupBy?: string, clusterName?: string): string => {
  const filtered = clusterName ? injectClusterFilter(baseExpr, clusterName) : baseExpr;
  if (!groupBy) return `sum(${filtered})`;
  return `sum by (${groupBy}) (${wrapLabelReplace(filtered)})`;
};

const useResourceUtilizationPolls = ({
  allClusters,
  cluster,
  groupBy,
}: UseResourceUtilizationPollsOptions): ResourceUtilizationPollsResult => {
  const [hubClusterName] = useHubClusterName();
  const pollOptions = allClusters ? { allClusters: true as const } : { cluster };
  const spokeCluster = cluster && cluster !== hubClusterName ? cluster : undefined;

  const [usedCPU, usedCPULoaded] = useFleetPrometheusPoll({
    ...pollOptions,
    endpoint: PrometheusEndpoint.QUERY,
    query: buildQuery(CPU_USED_EXPR, groupBy, spokeCluster),
  });

  const [totalCPU, totalCPULoaded] = useFleetPrometheusPoll({
    ...pollOptions,
    endpoint: PrometheusEndpoint.QUERY,
    query: buildQuery(CPU_TOTAL_EXPR, groupBy, spokeCluster),
  });

  const [usedMemory, usedMemoryLoaded] = useFleetPrometheusPoll({
    ...pollOptions,
    endpoint: PrometheusEndpoint.QUERY,
    query: buildQuery(MEMORY_USED_EXPR, groupBy, spokeCluster),
  });

  const [totalMemory, totalMemoryLoaded] = useFleetPrometheusPoll({
    ...pollOptions,
    endpoint: PrometheusEndpoint.QUERY,
    query: buildQuery(MEMORY_TOTAL_EXPR, groupBy, spokeCluster),
  });

  const [usedStorage, usedStorageLoaded] = useFleetPrometheusPoll({
    ...pollOptions,
    endpoint: PrometheusEndpoint.QUERY,
    query: buildQuery(STORAGE_USED_EXPR, groupBy, spokeCluster),
  });

  const [totalStorage, totalStorageLoaded] = useFleetPrometheusPoll({
    ...pollOptions,
    endpoint: PrometheusEndpoint.QUERY,
    query: buildQuery(STORAGE_TOTAL_EXPR, groupBy, spokeCluster),
  });

  const loaded =
    usedCPULoaded &&
    totalCPULoaded &&
    usedMemoryLoaded &&
    totalMemoryLoaded &&
    usedStorageLoaded &&
    totalStorageLoaded;

  return { loaded, totalCPU, totalMemory, totalStorage, usedCPU, usedMemory, usedStorage };
};

export default useResourceUtilizationPolls;
