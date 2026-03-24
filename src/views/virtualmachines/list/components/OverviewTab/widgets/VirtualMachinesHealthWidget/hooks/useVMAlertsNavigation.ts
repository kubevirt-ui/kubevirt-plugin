import { useMemo } from 'react';

import { KUBEVIRT, PERSPECTIVES } from '@kubevirt-utils/constants/constants';
import { getAlertsPath } from '@kubevirt-utils/constants/prometheus';
import { useMCOInstalled } from '@kubevirt-utils/hooks/useAlerts/utils/useMCOInstalled';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { buildSpokeConsoleUrl } from '@multicluster/urls';
import { useActivePerspective } from '@openshift-console/dynamic-plugin-sdk';
import { AlertResource } from '@overview/OverviewTab/status-card/utils/utils';

const buildVMAlertsUrlParams = (): string => {
  const params = new URLSearchParams();
  params.set('rowFilter-alert-state', 'firing');
  params.set('rowFilter-alert-source', 'platform');
  params.append('alerts', `kubernetes_operator_part_of=${KUBEVIRT}`);
  params.append('alerts', 'operator_health_impact=none');
  return `?${params.toString()}`;
};

const VM_ALERTS_URL_PARAMS = buildVMAlertsUrlParams();

type UseVMAlertsNavigation = {
  alertsBaseHref?: string;
  alertsBasePath?: string;
};

const useVMAlertsNavigation = (cluster?: string): UseVMAlertsNavigation => {
  const isAllClustersPage = useIsAllClustersPage();
  const [perspective] = useActivePerspective();
  const { isSpokeCluster, spokeConsoleURL } = useManagedClusterConsoleURLs(cluster);
  const { mcoInstalled } = useMCOInstalled();

  const alertsPerspective =
    perspective === PERSPECTIVES.FLEET_VIRTUALIZATION ? PERSPECTIVES.ADMIN : perspective;

  const alertsBasePath = useMemo(() => {
    if (isSpokeCluster) return undefined;
    if (isAllClustersPage)
      return mcoInstalled
        ? getAlertsPath(PERSPECTIVES.ACM, undefined, VM_ALERTS_URL_PARAMS)
        : undefined;
    return getAlertsPath(alertsPerspective, undefined, VM_ALERTS_URL_PARAMS);
  }, [alertsPerspective, isAllClustersPage, isSpokeCluster, mcoInstalled]);

  const alertsBaseHref = useMemo(() => {
    if (!isSpokeCluster) return undefined;
    return buildSpokeConsoleUrl(spokeConsoleURL, `${AlertResource.plural}${VM_ALERTS_URL_PARAMS}`);
  }, [isSpokeCluster, spokeConsoleURL]);

  return { alertsBaseHref, alertsBasePath };
};

export default useVMAlertsNavigation;
