import { useMemo } from 'react';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { PrometheusRulesResponse } from '@kubevirt-utils/types/prometheus';
import {
  Alert,
  PrometheusEndpoint,
  PrometheusResponse,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

import useSilences from '../useSilences/useSilences';

import { convertMetricResultsToAlerts, convertRulesToAlerts } from './utils/metricToAlerts';
import { silenceFiringAlerts } from './utils/utils';

type UseSingleClusterAlerts = () => {
  alerts: Alert[];
  error: Error | unknown;
  loaded: boolean;
};

/**
 * Hook for fetching alerts in non-ACM (single cluster) environments.
 * Admins use RULES endpoint for complete alert metadata.
 * Non-admins use QUERY with ALERTS metric for namespace-scoped access.
 */
const useSingleClusterAlerts: UseSingleClusterAlerts = () => {
  const { silences } = useSilences();
  const isAdmin = useIsAdmin();
  const activeNamespace = useActiveNamespace();

  const [rulesResponse, rulesLoaded, rulesError] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.RULES,
  });

  const alertsQuery = useMemo(() => {
    if (isAdmin) return;

    if (!activeNamespace || activeNamespace === ALL_NAMESPACES_SESSION_KEY) {
      return;
    }

    return `ALERTS{namespace="${activeNamespace}",alertstate="firing",kubernetes_operator_part_of="kubevirt"}`;
  }, [isAdmin, activeNamespace]);

  const [alertsResponse, alertsLoaded, alertsError] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: alertsQuery,
  });

  const alerts = useMemo(() => {
    const response = isAdmin ? rulesResponse : alertsResponse;
    const error = isAdmin ? rulesError : alertsError;

    if (!response || error) {
      return [];
    }

    const convertedAlerts = isAdmin
      ? convertRulesToAlerts(response as PrometheusRulesResponse)
      : convertMetricResultsToAlerts(response as PrometheusResponse);

    return silenceFiringAlerts(convertedAlerts, silences);
  }, [isAdmin, rulesResponse, rulesError, alertsResponse, alertsError, silences]);

  return {
    alerts,
    error: isAdmin ? rulesError : alertsError,
    loaded: isAdmin ? rulesLoaded : alertsLoaded,
  };
};

export default useSingleClusterAlerts;
