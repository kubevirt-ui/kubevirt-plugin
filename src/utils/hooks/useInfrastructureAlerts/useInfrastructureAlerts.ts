import { useMemo } from 'react';

import useAlerts from '@kubevirt-utils/hooks/useAlerts/useAlerts';
import {
  getNumberOfAlerts,
  isFiringOrSilencedAlert,
  isImportantInfrastructureAlert,
  sortAlertsByHealthImpact,
} from '@kubevirt-utils/hooks/useInfrastructureAlerts/utils/utils';
import { isKubeVirtAlert } from '@kubevirt-utils/hooks/useKubevirtAlerts';
import { Alert } from '@openshift-console/dynamic-plugin-sdk';

export type AlertsByHealthImpact = { critical: Alert[]; warning: Alert[]; none: Alert[] };

type UseInfrastructureAlerts = () => {
  alerts: AlertsByHealthImpact;
  numberOfAlerts: number;
  loaded: boolean;
  loadError: unknown;
};

const useInfrastructureAlerts: UseInfrastructureAlerts = () => {
  const { alerts, loaded, loadError } = useAlerts();

  const alertsByHealthImpact = useMemo(() => {
    const filteredAlerts = alerts?.filter(
      (alert) =>
        isKubeVirtAlert(alert) &&
        isFiringOrSilencedAlert(alert) &&
        isImportantInfrastructureAlert(alert),
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
