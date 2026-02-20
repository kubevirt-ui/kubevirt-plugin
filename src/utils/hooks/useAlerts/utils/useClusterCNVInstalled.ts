import { useMemo } from 'react';

import { SubscriptionModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { KUBEVIRT_HYPERCONVERGED } from '@kubevirt-utils/constants/constants';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { operatorNamespaceSignal } from '@kubevirt-utils/hooks/useOperatorNamespace/useOperatorNamespace';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import { SubscriptionKind } from '@overview/utils/types';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

export const useClusterCNVInstalled = (): {
  cnvInstalledClusters: string[];
  cnvNotInstalledClusters: string[];
  loaded: boolean;
} => {
  const [clusterNames, clustersLoaded] = useFleetClusterNames();
  const operatorNamespace = operatorNamespaceSignal.value;

  const [allSubscriptions, subscriptionsLoaded] = useKubevirtWatchResource<SubscriptionKind[]>({
    groupVersionKind: SubscriptionModelGroupVersionKind,
    isList: true,
    namespace: operatorNamespace ?? DEFAULT_OPERATOR_NAMESPACE,
  });

  const { cnvInstalledClusters, cnvNotInstalledClusters } = useMemo(() => {
    if (!clusterNames || !allSubscriptions) {
      return { cnvInstalledClusters: [], cnvNotInstalledClusters: [] };
    }

    const installed: string[] = [];
    const notInstalled: string[] = [];
    const subscriptionsByCluster = new Map<string, SubscriptionKind[]>();
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
