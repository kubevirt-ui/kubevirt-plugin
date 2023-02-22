import { useMemo } from 'react';

import useAlerts from '@kubevirt-utils/hooks/useAlerts';
import {
  getNumberOfAlerts,
  isFiringAlert,
  isInfrastructureAlert,
  sortAlertsByHealthImpact,
} from '@kubevirt-utils/hooks/useInfrastructureAlerts/utils/utils';
import { isKubeVirtAlert } from '@kubevirt-utils/hooks/useKubevirtAlerts';
import { Alert } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';

export type AlertsByHealthImpact = { critical: Alert[]; warning: Alert[]; none: Alert[] };

type UseInfrastructureAlerts = () => {
  alerts: AlertsByHealthImpact;
  numberOfAlerts: number;
  loaded: boolean;
  loadError: Error;
};

const useInfrastructureAlerts: UseInfrastructureAlerts = () => {
  const { alerts, loaded, loadError } = useAlerts();

  const alertsByHealthImpact = useMemo(() => {
    const filteredAlerts = alerts?.filter(
      (alert) => isKubeVirtAlert(alert) && isFiringAlert(alert) && isInfrastructureAlert(alert),
    );

    return sortAlertsByHealthImpact(filteredAlerts);
  }, [alerts]);

  return {
    alerts: alertsByHealthImpact,
    numberOfAlerts: getNumberOfAlerts(alertsByHealthImpact) || 0,
    loaded,
    loadError,
  };
};

export default useInfrastructureAlerts;
