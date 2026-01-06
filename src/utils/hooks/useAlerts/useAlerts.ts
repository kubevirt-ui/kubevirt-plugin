import { useMemo } from 'react';

import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
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
import useSingleClusterAlerts from './useSingleClusterAlerts';

type UseAlerts = () => {
  alerts: Alert[];
  error: Error | unknown;
  loaded: boolean;
};

const useAlerts: UseAlerts = () => {
  const cluster = useActiveClusterParam();
  const [hubClusterName] = useHubClusterName();
  const isACMPage = useIsACMPage();
  const {
    enabledClusters,
    error: observabilityError,
    loaded: observabilityLoaded,
  } = useClusterObservabilityDisabled(true);

  // For non-ACM pages, use the single cluster alerts hook
  const singleClusterAlerts = useSingleClusterAlerts();

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

  // Build query for all kubevirt alerts (no operator_health_impact filter to get all)
  // When selectedClusters is provided, use it instead of the single cluster parameter
  const query = useMemo(() => {
    if (!isACMPage) {
      return undefined; // Don't build query for non-ACM pages (we use RULES endpoint)
    }

    // When selectedClusters is provided, don't pass single cluster/hubClusterName
    // The buildAlertsQuery function will use selectedClusters for filtering
    let clusterParam: string | undefined = undefined;
    let hubClusterNameParam: string | undefined = undefined;

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
  }, [isACMPage, cluster, hubClusterName, isAllClusters, selectedClusters, hasSelectedClusters]);

  // For ACM pages, use QUERY endpoint with ALERTS metric for multicluster support
  const { silences } = useSilences();
  const [metricResponse, metricLoaded, metricError] = useFleetPrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: isACMPage && query ? query : undefined, // Only query for ACM pages with valid query
    ...(isACMPage && (isAllClusters || hasSelectedClusters) ? { allClusters: true } : {}),
    ...(isACMPage && !isAllClusters && !hasSelectedClusters && cluster ? { cluster } : {}),
  });

  const allAlerts = useMemo(() => {
    if (isACMPage) {
      // For ACM pages, use ALERTS metric query results
      if (!metricResponse || metricError) {
        return [];
      }
      const alerts = convertMetricResultsToAlerts(metricResponse as PrometheusResponse);
      return silenceFiringAlerts(alerts, silences);
    } else {
      // For non-ACM pages, use single cluster alerts hook
      return singleClusterAlerts.alerts;
    }
  }, [isACMPage, metricResponse, metricError, silences, singleClusterAlerts.alerts]);

  return {
    alerts: allAlerts,
    error: observabilityError || (isACMPage ? metricError : singleClusterAlerts.error),
    loaded: isACMPage ? metricLoaded && observabilityLoaded : singleClusterAlerts.loaded,
  };
};

export default useAlerts;
