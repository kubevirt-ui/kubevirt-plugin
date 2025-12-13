import { useMemo } from 'react';

import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import {
  Alert,
  PrometheusEndpoint,
  PrometheusResponse,
} from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll, useHubClusterName } from '@stolostron/multicluster-sdk';

import useSilences from '../useSilences/useSilences';

import { buildAlertsQuery } from './utils/alertQueries';
import { convertMetricResultsToAlerts } from './utils/metricToAlerts';
import { useClusterObservabilityDisabled } from './utils/useClusterObservabilityDisabled';
import { silenceFiringAlerts } from './utils/utils';

type UseAlerts = () => {
  alerts: Alert[];
  error: Error | unknown;
  loaded: boolean;
};

const useAlerts: UseAlerts = () => {
  const { silences } = useSilences();
  const cluster = useActiveClusterParam();
  const [hubClusterName] = useHubClusterName();
  const {
    enabledClusters,
    error: observabilityError,
    loaded: observabilityLoaded,
  } = useClusterObservabilityDisabled(true);

  // Automatically filter by enabled clusters when querying all clusters
  const selectedClusters = useMemo(() => {
    if (cluster === ALL_CLUSTERS_KEY && observabilityLoaded && enabledClusters.length > 0) {
      return enabledClusters;
    }
    return undefined;
  }, [cluster, observabilityLoaded, enabledClusters]);

  // Determine if we should query all clusters or specific clusters
  const isAllClusters = cluster === ALL_CLUSTERS_KEY;
  const hasSelectedClusters = selectedClusters && selectedClusters.length > 0;
  const shouldQueryAllClusters = isAllClusters || hasSelectedClusters;

  // Build query for all kubevirt alerts (no operator_health_impact filter to get all)
  // When selectedClusters is provided, use it instead of the single cluster parameter
  const query = useMemo(() => {
    // When selectedClusters is provided, don't pass single cluster/hubClusterName
    // The buildAlertsQuery function will use selectedClusters for filtering
    let clusterParam: null | string = null;
    let hubClusterNameParam: null | string = null;

    if (!hasSelectedClusters) {
      if (!isAllClusters) {
        clusterParam = cluster;
        hubClusterNameParam = hubClusterName;
      }
    }

    return buildAlertsQuery(
      clusterParam,
      hubClusterNameParam,
      undefined,
      undefined,
      selectedClusters,
    );
  }, [cluster, hubClusterName, isAllClusters, selectedClusters, hasSelectedClusters]);

  const [response, responseLoaded, responseError] = useFleetPrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query,
    ...(shouldQueryAllClusters ? { allClusters: true } : { cluster }),
  });

  const allAlerts = useMemo(() => {
    if (!response || responseError) {
      return [];
    }

    // Convert ALERTS metric results to Alert objects
    const alerts = convertMetricResultsToAlerts(response as PrometheusResponse);

    // Apply silences to alerts
    return silenceFiringAlerts(alerts, silences);
  }, [response, responseError, silences]);

  return {
    alerts: allAlerts,
    error: observabilityError || responseError,
    loaded: responseLoaded,
  };
};

export default useAlerts;
