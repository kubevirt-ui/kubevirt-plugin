import { useMemo } from 'react';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import type { PrometheusRulesResponse } from '@kubevirt-utils/types/prometheus';
import type { Alert, PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';

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
 * Users with cluster monitoring access use the RULES endpoint for complete alert metadata.
 * Others use QUERY with the ALERTS metric for namespace-scoped access.
 */
const useSingleClusterAlerts: UseSingleClusterAlerts = () => {
  const { silences } = useSilences();
  const activeNamespace = useActiveNamespace();

  const [rulesResponse, rulesLoaded, rulesError] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.RULES,
  });

  const canUsePrometheusRules = rulesLoaded && !rulesError;

  const alertsQuery = useMemo(() => {
    if (canUsePrometheusRules) return;

    if (!activeNamespace || activeNamespace === ALL_NAMESPACES_SESSION_KEY) {
      return;
    }

    return `ALERTS{namespace="${activeNamespace}",alertstate="firing",kubernetes_operator_part_of="kubevirt"}`;
  }, [activeNamespace, canUsePrometheusRules]);

  const [alertsResponse, alertsLoaded, alertsError] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: alertsQuery,
  });

  const alerts = useMemo(() => {
    const response = canUsePrometheusRules ? rulesResponse : alertsResponse;
    const error = canUsePrometheusRules ? rulesError : alertsError;

    if (!response || error) {
      return [];
    }

    const convertedAlerts = canUsePrometheusRules
      ? convertRulesToAlerts(response as PrometheusRulesResponse)
      : convertMetricResultsToAlerts(response as PrometheusResponse);

    return silenceFiringAlerts(convertedAlerts, silences);
  }, [alertsError, alertsResponse, canUsePrometheusRules, rulesError, rulesResponse, silences]);

  return {
    alerts,
    error: canUsePrometheusRules ? rulesError : alertsError,
    loaded: canUsePrometheusRules ? rulesLoaded : alertsLoaded,
  };
};

export default useSingleClusterAlerts;
