import { useMemo } from 'react';

import { SUCCESS } from '@kubevirt-utils/hooks/useAlerts/utils/constants';
import {
  getAlertsAndRules,
  silenceFiringAlerts,
} from '@kubevirt-utils/hooks/useAlerts/utils/utils';
import useSilences from '@kubevirt-utils/hooks/useSilences/useSilences';
import { PrometheusRulesResponse } from '@kubevirt-utils/types/prometheus';
import {
  Alert,
  PrometheusEndpoint,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

type UseAlerts = () => { alerts: Alert[]; loaded: boolean };

const useAlerts: UseAlerts = () => {
  const { silences } = useSilences();
  const [response] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.RULES,
  });
  const pollingStatus = (response as PrometheusRulesResponse)?.status;

  const allAlerts = useMemo(() => {
    const { alerts } = getAlertsAndRules((response as PrometheusRulesResponse)?.data);

    return silenceFiringAlerts(alerts, silences);
  }, [response]);

  return { alerts: allAlerts || [], loaded: pollingStatus === SUCCESS };
};

export default useAlerts;
