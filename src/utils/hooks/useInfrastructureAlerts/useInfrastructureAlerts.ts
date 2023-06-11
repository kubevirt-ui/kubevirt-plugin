import { useMemo } from 'react';

import useAlerts from '@kubevirt-utils/hooks/useAlerts/useAlerts';
import {
  getNumberOfAlerts,
  isFiringOrSilencedAlert,
  isImportantInfrastructureAlert,
  sortAlertsByHealthImpact,
} from '@kubevirt-utils/hooks/useInfrastructureAlerts/utils/utils';
import { isKubeVirtAlert } from '@kubevirt-utils/utils/prometheus';
import { Alert } from '@openshift-console/dynamic-plugin-sdk';

export type AlertsByHealthImpact = { critical: Alert[]; none: Alert[]; warning: Alert[] };

type UseInfrastructureAlerts = () => {
  alerts: AlertsByHealthImpact;
  loaded: boolean;
  numberOfAlerts: number;
};

const useInfrastructureAlerts: UseInfrastructureAlerts = () => {
  const { alerts, loaded } = useAlerts();

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
    loaded,
    numberOfAlerts: getNumberOfAlerts(alertsByHealthImpact) || 0,
  };
};

export default useInfrastructureAlerts;
