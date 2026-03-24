import { useMemo } from 'react';

import { AlertType } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { KUBEVIRT } from '@kubevirt-utils/constants/constants';
import { OPERATOR_LABEL_KEY } from '@kubevirt-utils/constants/prometheus';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useAlerts from '@kubevirt-utils/hooks/useAlerts/useAlerts';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { Alert, AlertSeverity, AlertStates } from '@openshift-console/dynamic-plugin-sdk';

type VMAlertCounts = Record<AlertType, number> & {
  error: Error | unknown;
  loaded: boolean;
};

const isVMRelatedAlert = (alert: Alert, namespace?: string): boolean => {
  if (alert?.labels?.[OPERATOR_LABEL_KEY] !== KUBEVIRT) return false;
  if (alert?.state !== AlertStates.Firing) return false;
  if (namespace && namespace !== ALL_NAMESPACES_SESSION_KEY) {
    return alert?.labels?.namespace === namespace;
  }
  return true;
};

const countBySeverity = (alerts: Alert[]): Record<AlertType, number> => {
  const counts: Record<AlertType, number> = {
    [AlertType.critical]: 0,
    [AlertType.info]: 0,
    [AlertType.warning]: 0,
  };
  alerts?.forEach((alert) => {
    const severity = alert.labels?.severity;
    if (severity === AlertSeverity.Critical) counts[AlertType.critical]++;
    else if (severity === AlertSeverity.Warning) counts[AlertType.warning]++;
    else if (severity === AlertSeverity.Info) counts[AlertType.info]++;
  });
  return counts;
};

const useVMAlerts = (): VMAlertCounts => {
  const { alerts, error, loaded } = useAlerts();
  const namespace = useNamespaceParam();

  const vmAlerts = useMemo(
    () => alerts?.filter((alert) => isVMRelatedAlert(alert, namespace)),
    [alerts, namespace],
  );

  return useMemo(
    () => ({
      ...countBySeverity(vmAlerts),
      error,
      loaded,
    }),
    [vmAlerts, loaded, error],
  );
};

export default useVMAlerts;
