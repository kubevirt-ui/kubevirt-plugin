import { useMemo } from 'react';

import {
  getAlertsAndRules,
  silenceFiringAlerts,
} from '@kubevirt-utils/hooks/useAlerts/utils/utils';
import useSilences from '@kubevirt-utils/hooks/useSilences/useSilences';
import {
  Alert,
  PrometheusEndpoint,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';
import { PrometheusRulesResponse } from '@virtualmachines/details/tabs/overview/utils/utils';

type UseAlerts = () => { alerts: Alert[]; loaded: boolean; loadError: unknown };

const useAlerts: UseAlerts = () => {
  const [response] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.RULES,
  });
  const { silences } = useSilences();

  const allAlerts = useMemo(() => {
    const data = (response as PrometheusRulesResponse)?.data;
    const { alerts } = getAlertsAndRules(data);

    return silenceFiringAlerts(alerts, silences);
  }, [response]);

  return { alerts: allAlerts || [], loaded: true, loadError: null };
};

export default useAlerts;
