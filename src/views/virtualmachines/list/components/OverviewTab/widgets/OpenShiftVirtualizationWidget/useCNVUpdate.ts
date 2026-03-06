import { useMemo } from 'react';

import { ClusterServiceVersionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtClusterServiceVersion } from '@kubevirt-utils/hooks/useKubevirtClusterServiceVersion';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { buildUrlForCSVSubscription } from '@overview/utils/utils';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { isUpdateAvailable } from './utils';

type UseCNVUpdateResult = {
  isSpokeCluster: boolean;
  operatorLink: string;
  operatorLinkExternal?: string;
  updateAvailable: boolean;
};

export const useCNVUpdate = (cluster?: string, isAllClustersPage = false): UseCNVUpdateResult => {
  const [hubClusterName] = useHubClusterName();
  const { getConsoleURL } = useManagedClusterConsoleURLs();
  const { installedCSV, subscription } = useKubevirtClusterServiceVersion(cluster);

  const updateAvailable = useMemo(
    () => !isAllClustersPage && isUpdateAvailable(subscription),
    [isAllClustersPage, subscription],
  );

  const { isSpokeCluster, operatorLink, operatorLinkExternal } = useMemo(() => {
    if (!installedCSV?.metadata?.name || !subscription?.metadata?.namespace) {
      return { isSpokeCluster: false, operatorLink: '', operatorLinkExternal: undefined };
    }

    const path = buildUrlForCSVSubscription(
      ClusterServiceVersionModel,
      installedCSV.metadata.name,
      subscription.metadata.namespace,
    );

    const isSpoke = Boolean(cluster && cluster !== hubClusterName);
    const spokeConsoleURL = isSpoke ? getConsoleURL(cluster) : undefined;

    const link = isSpoke ? path.replace(/^\/k8s/, `/k8s/cluster/${cluster}`) : path;

    return {
      isSpokeCluster: isSpoke && Boolean(spokeConsoleURL),
      operatorLink: link,
      operatorLinkExternal: spokeConsoleURL ? `${spokeConsoleURL}${path}` : undefined,
    };
  }, [
    cluster,
    hubClusterName,
    getConsoleURL,
    installedCSV?.metadata?.name,
    subscription?.metadata?.namespace,
  ]);

  return { isSpokeCluster, operatorLink, operatorLinkExternal, updateAvailable };
};
