import { useMemo } from 'react';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useAlerts from '@kubevirt-utils/hooks/useAlerts/useAlerts';
import { inNamespace, isKubeVirtAlert } from '@kubevirt-utils/utils/prometheus';
import { Alert } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

export type UseKubevirtAlerts = () => [Alert[], boolean];

const useKubevirtAlerts: UseKubevirtAlerts = () => {
  const [activeNamespace] = useActiveNamespace();
  const { alerts, loaded } = useAlerts();
  const filteredAlerts: Alert[] = useMemo(() => {
    if (activeNamespace && activeNamespace !== ALL_NAMESPACES_SESSION_KEY) {
      return alerts?.filter(
        (alert) => isKubeVirtAlert(alert) && inNamespace(activeNamespace, alert),
      );
    }

    return alerts?.filter((alert) => isKubeVirtAlert(alert));
  }, [activeNamespace, alerts]);

  return [filteredAlerts, loaded];
};

export default useKubevirtAlerts;
