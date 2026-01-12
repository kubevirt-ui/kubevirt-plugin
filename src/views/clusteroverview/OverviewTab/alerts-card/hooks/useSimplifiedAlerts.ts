import React from 'react';

import { SimplifiedAlerts } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { createAlertKey } from '@kubevirt-utils/components/AlertsCard/utils/utils';
import useKubevirtAlerts from '@kubevirt-utils/hooks/useKubevirtAlerts';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { getAlertFilterURL, getExternalAlertURL } from '../../status-card/utils/utils';

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

  const simplifiedAlerts = React.useMemo(() => {
    // eslint-disable-next-line perfectionist/sort-objects
    const data = { critical: [], warning: [], info: [] };
    return (
      alerts.reduce((acc, alert) => {
        const alertCluster = alert?.labels?.cluster;
        const alertName = alert?.labels?.alertname;
        const isSpokeClusterAlert = isACMPage && alertCluster && alertCluster !== hubClusterName;

        // Get external URL for spoke cluster alerts (opens in new tab)
        const externalLink = isSpokeClusterAlert
          ? getExternalAlertURL(alertName, getConsoleURL(alertCluster))
          : undefined;

        const vmName = alert?.labels?.name || alert?.labels?.vmName;
        const namespace = alert?.labels?.namespace;

        acc[alert?.labels?.severity] = [
          ...(acc?.[alert?.labels?.severity] || []),
          {
            alertName,
            cluster: alertCluster,
            description: alert?.annotations?.description || alert?.annotations?.summary,
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
      }, data) || data
    );
  }, [alerts, isACMPage, hubClusterName, getConsoleURL]);

  return { alerts: simplifiedAlerts, error, loaded: loaded && consoleURLsLoaded };
};

export default useSimplifiedAlerts;
