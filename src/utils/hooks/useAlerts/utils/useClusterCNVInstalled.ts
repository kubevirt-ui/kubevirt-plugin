import { useMemo } from 'react';

import { SubscriptionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console/models/SubscriptionModel';
import { KUBEVIRT_HYPERCONVERGED } from '@kubevirt-utils/constants/constants';
import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { SubscriptionKind } from '@overview/utils/types';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

/**
 * Get a list of clusters with CNV installed
 * by checking for the KubeVirt HyperConverged subscription in each cluster
 */
export const useClusterCNVInstalled = (): {
  cnvInstalledClusters: string[];
  cnvNotInstalledClusters: string[];
  loaded: boolean;
} => {
  const [clusterNames, clustersLoaded] = useFleetClusterNames();

  // Fetch subscriptions for all clusters using ALL_CLUSTERS_KEY
  const [allSubscriptions, subscriptionsLoaded] = useK8sWatchData<SubscriptionKind[]>({
    cluster: ALL_CLUSTERS_KEY,
    groupVersionKind: SubscriptionModelGroupVersionKind,
    isList: true,
    namespace: DEFAULT_OPERATOR_NAMESPACE,
  });

  // Parse subscriptions to determine which clusters have CNV installed
  const { cnvInstalledClusters, cnvNotInstalledClusters } = useMemo(() => {
    if (!clusterNames || !allSubscriptions) {
      return { cnvInstalledClusters: [], cnvNotInstalledClusters: [] };
    }

    const installed: string[] = [];
    const notInstalled: string[] = [];

    // Group subscriptions by cluster
    // Search results return Fleet<T>[] where each item has a cluster property
    const subscriptionsByCluster = new Map<string, SubscriptionKind[]>();

    // Handle both array and Fleet<T>[] format from search results
    const subscriptions = Array.isArray(allSubscriptions) ? allSubscriptions : [];

    subscriptions.forEach((sub: SubscriptionKind & { cluster?: string }) => {
      const cluster = sub?.cluster;
      if (cluster) {
        if (!subscriptionsByCluster.has(cluster)) {
          subscriptionsByCluster.set(cluster, []);
        }
        subscriptionsByCluster.get(cluster)?.push(sub);
      }
    });

    // Check each cluster for CNV subscription
    clusterNames.forEach((clusterName) => {
      const clusterSubs = subscriptionsByCluster.get(clusterName) || [];
      const hasCNV = clusterSubs.some((sub) => sub?.spec?.name?.endsWith(KUBEVIRT_HYPERCONVERGED));

      if (hasCNV) {
        installed.push(clusterName);
      } else {
        notInstalled.push(clusterName);
      }
    });

    return {
      cnvInstalledClusters: installed,
      cnvNotInstalledClusters: notInstalled,
    };
  }, [clusterNames, allSubscriptions]);

  return {
    cnvInstalledClusters,
    cnvNotInstalledClusters,
    loaded: clustersLoaded && subscriptionsLoaded,
  };
};
