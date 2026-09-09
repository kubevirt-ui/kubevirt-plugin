import { useMemo } from 'react';

import {
  AlertType,
  type SimplifiedAlerts,
} from '@kubevirt-utils/components/AlertsCard/utils/types';
import { createAlertKey } from '@kubevirt-utils/components/AlertsCard/utils/utils';
import useKubevirtAlerts from '@kubevirt-utils/hooks/useKubevirtAlerts';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { getAlertFilterURL, getExternalAlertURL } from '../../status-card/utils/utils';

type AlertSeverity = AlertType | string | undefined;

const isAlertSeverity = (severity: AlertSeverity): severity is AlertType =>
  severity === AlertType.Critical || severity === AlertType.Warning || severity === AlertType.Info;

type UseSimplifiedAlerts = () => {
  alerts: SimplifiedAlerts;
  error: Error | unknown;
  loaded: boolean;
};

const useSimplifiedAlerts: UseSimplifiedAlerts = () => {
  const [alerts, loaded, error] = useKubevirtAlerts();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();
  const { getConsoleURL, loaded: consoleURLsLoaded } = useManagedClusterConsoleURLs();

  const simplifiedAlerts = useMemo((): SimplifiedAlerts => {
    const data: SimplifiedAlerts = {
      [AlertType.Critical]: [],
      [AlertType.Info]: [],
      [AlertType.Warning]: [],
    };

    return alerts.reduce<SimplifiedAlerts>((acc, alert) => {
      const severity = alert?.labels?.severity;
      if (!isAlertSeverity(severity)) {
        return acc;
      }

      const alertCluster = alert?.labels?.cluster;
      const alertName = alert?.labels?.alertname;
      const isSpokeClusterAlert = isACMPage && alertCluster && alertCluster !== hubClusterName;

      // Get external URL for spoke cluster alerts (opens in new tab)
      const externalLink = isSpokeClusterAlert
        ? getExternalAlertURL(alertName, getConsoleURL(alertCluster))
        : undefined;

      const vmName = alert?.labels?.name ?? alert?.labels?.vmName;
      const namespace = alert?.labels?.namespace;

      acc[severity] = [
        ...acc[severity],
        {
          alertName,
          cluster: alertCluster,
          description: alert?.annotations?.description ?? alert?.annotations?.summary,
          externalLink,
          isVMAlert: Boolean(vmName),
          key: createAlertKey(alert?.activeAt, alert?.labels),
          link: getAlertFilterURL(alertName),
          namespace,
          time: alert?.activeAt,
          vmName,
        },
      ];
      return acc;
    }, data);
  }, [alerts, isACMPage, hubClusterName, getConsoleURL]);

  return { alerts: simplifiedAlerts, error, loaded: loaded && consoleURLsLoaded };
};

export default useSimplifiedAlerts;
