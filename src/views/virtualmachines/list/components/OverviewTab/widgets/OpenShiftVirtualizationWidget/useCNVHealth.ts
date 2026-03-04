import { useMemo } from 'react';

import { HCOHealthStatus } from '@kubevirt-utils/extensions/dashboard/types';
import {
  HealthState,
  PrometheusEndpoint,
  PrometheusResponse,
} from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';

const HCO_HEALTH_QUERY = 'kubevirt_hyperconverged_operator_health_status';

const hcoValueToHealthState: Record<number, HealthState> = {
  [HCOHealthStatus.critical]: HealthState.ERROR,
  [HCOHealthStatus.none]: HealthState.OK,
  [HCOHealthStatus.warning]: HealthState.WARNING,
};

type UseCNVHealthResult = {
  criticalClusters: string[];
  criticalCount: number;
  degradedClusters: string[];
  degradedCount: number;
  error: null | unknown;
  healthState: HealthState;
  loaded: boolean;
};

export const useCNVHealth = (cluster?: string, allClusters = false): UseCNVHealthResult => {
  const [response, loaded, error] = useFleetPrometheusPoll({
    allClusters,
    cluster,
    endpoint: PrometheusEndpoint.QUERY,
    query: HCO_HEALTH_QUERY,
  });

  return useMemo(() => {
    if (!response || error) {
      return {
        criticalClusters: [],
        criticalCount: 0,
        degradedClusters: [],
        degradedCount: 0,
        error: error ?? null,
        healthState: HealthState.NOT_AVAILABLE,
        loaded,
      };
    }

    const results = (response as PrometheusResponse)?.data?.result || [];

    const criticalClusters: string[] = [];
    const degradedClusters: string[] = [];
    let clusterHealthState = HealthState.NOT_AVAILABLE;

    results.forEach((result) => {
      const value = Number(result?.value?.[1]);
      const resultCluster = result?.metric?.cluster;

      if (Number.isNaN(value)) return;

      if (value === HCOHealthStatus.critical) {
        if (resultCluster) criticalClusters.push(resultCluster);
      } else if (value === HCOHealthStatus.warning) {
        if (resultCluster) degradedClusters.push(resultCluster);
      }

      const isLocalMatch = !cluster && !resultCluster;
      const isClusterMatch = cluster && (!resultCluster || resultCluster === cluster);

      if (isLocalMatch || isClusterMatch) {
        clusterHealthState = hcoValueToHealthState[value] ?? HealthState.NOT_AVAILABLE;
      }
    });

    return {
      criticalClusters,
      criticalCount: criticalClusters.length,
      degradedClusters,
      degradedCount: degradedClusters.length,
      error: null,
      healthState: clusterHealthState,
      loaded,
    };
  }, [response, error, loaded, cluster]);
};
