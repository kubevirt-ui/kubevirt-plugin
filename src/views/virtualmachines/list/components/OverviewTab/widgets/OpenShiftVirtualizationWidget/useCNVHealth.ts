import { useMemo } from 'react';

import {
  HealthState,
  PrometheusEndpoint,
  PrometheusResponse,
} from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';

import { HCO_HEALTH_QUERY, processHealthResults } from './utils';

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
    const { clusterHealthState, criticalClusters, degradedClusters } = processHealthResults(
      results,
      cluster,
    );

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
