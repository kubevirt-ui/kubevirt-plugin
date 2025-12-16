import { useMemo } from 'react';

import { PrometheusRulesResponse } from '@kubevirt-utils/types/prometheus';
import {
  Alert,
  PrometheusEndpoint,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

import useSilences from '../useSilences/useSilences';

import { convertRulesToAlerts } from './utils/metricToAlerts';
import { silenceFiringAlerts } from './utils/utils';

type UseSingleClusterAlerts = () => {
  alerts: Alert[];
  error: Error | unknown;
  loaded: boolean;
};

/**
 * Hook for fetching alerts in non-ACM (single cluster) environments.
 * Uses the Prometheus RULES endpoint to get full alert information including timestamps and descriptions.
 */
const useSingleClusterAlerts: UseSingleClusterAlerts = () => {
  const { silences } = useSilences();

  const [rulesResponse, rulesLoaded, rulesError] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.RULES,
  });

  const alerts = useMemo(() => {
    if (!rulesResponse || rulesError) {
      return [];
    }
    const convertedAlerts = convertRulesToAlerts(rulesResponse as PrometheusRulesResponse);
    return silenceFiringAlerts(convertedAlerts, silences);
  }, [rulesResponse, rulesError, silences]);

  return {
    alerts,
    error: rulesError,
    loaded: rulesLoaded,
  };
};

export default useSingleClusterAlerts;
