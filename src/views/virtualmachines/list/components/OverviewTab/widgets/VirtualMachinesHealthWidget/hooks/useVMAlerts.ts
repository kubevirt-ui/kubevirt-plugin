import { useMemo } from 'react';

import { KUBEVIRT } from '@kubevirt-utils/constants/constants';
import { OPERATOR_LABEL_KEY } from '@kubevirt-utils/constants/prometheus';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useAlerts from '@kubevirt-utils/hooks/useAlerts/useAlerts';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { Alert, AlertSeverity, AlertStates } from '@openshift-console/dynamic-plugin-sdk';

type VMAlertCounts = {
  critical: number;
  error: Error | unknown;
  info: number;
  loaded: boolean;
  warning: number;
};

const isVMRelatedAlert = (alert: Alert, namespace?: string): boolean => {
  if (alert?.labels?.[OPERATOR_LABEL_KEY] !== KUBEVIRT) return false;
  if (alert?.state !== AlertStates.Firing) return false;
  if (namespace && namespace !== ALL_NAMESPACES_SESSION_KEY) {
    return alert?.labels?.namespace === namespace;
  }
  return true;
};

const countBySeverity = (alerts: Alert[]): Pick<VMAlertCounts, 'critical' | 'info' | 'warning'> => {
  const counts = { critical: 0, info: 0, warning: 0 };
  alerts?.forEach((alert) => {
    const severity = alert.labels?.severity;
    if (severity === AlertSeverity.Critical) counts.critical++;
    else if (severity === AlertSeverity.Warning) counts.warning++;
    else if (severity === AlertSeverity.Info) counts.info++;
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
