import { useMemo } from 'react';

import { AlertType } from '@kubevirt-utils/components/AlertsCard/utils/types';
import useAlerts from '@kubevirt-utils/hooks/useAlerts/useAlerts';
import {
  getNumberOfAlerts,
  isCriticalHealthImpactAlert,
  isFiringOrSilencedAlert,
  sortAlertsBySeverity,
} from '@kubevirt-utils/hooks/useInfrastructureAlerts/utils/utils';
import { isKubeVirtAlert } from '@kubevirt-utils/utils/prometheus';
import { Alert } from '@openshift-console/dynamic-plugin-sdk';

export type AlertsBySeverity = { [key in AlertType]: Alert[] };

type UseInfrastructureAlerts = () => {
  alerts: AlertsBySeverity;
  loaded: boolean;
  numberOfAlerts: number;
};

const useInfrastructureAlerts: UseInfrastructureAlerts = () => {
  const { alerts, loaded } = useAlerts();

  const alertsBySeverity = useMemo(() => {
    const filteredAlerts = alerts?.filter(
      (alert) =>
        isKubeVirtAlert(alert) &&
        isFiringOrSilencedAlert(alert) &&
        isCriticalHealthImpactAlert(alert),
    );

    return sortAlertsBySeverity(filteredAlerts);
  }, [alerts]);

  return {
    alerts: alertsBySeverity,
    loaded,
    numberOfAlerts: getNumberOfAlerts(alertsBySeverity) || 0,
  };
};

export default useInfrastructureAlerts;
