import { useCallback, useMemo } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetK8sWatchResource, useHubClusterName } from '@stolostron/multicluster-sdk';

import { CONSOLE_URL_CLAIM, ManagedClusterModel } from '../constants';

type ManagedCluster = K8sResourceCommon & {
  status?: {
    clusterClaims?: Array<{
      name: string;
      value: string;
    }>;
  };
};

type UseManagedClusterConsoleURLs = () => {
  consoleURLs: Record<string, string>;
  error: unknown;
  getConsoleURL: (clusterName: string) => string | undefined;
  loaded: boolean;
};

/**
 * Hook to get console URLs for all managed clusters.
 * Returns a map of cluster names to their console URLs and a helper function.
 */
const useManagedClusterConsoleURLs: UseManagedClusterConsoleURLs = () => {
  const [hubClusterName] = useHubClusterName();

  const [managedClusters, loaded, error] = useFleetK8sWatchResource<ManagedCluster[]>({
    groupVersionKind: modelToGroupVersionKind(ManagedClusterModel),
    isList: true,
  });

  const consoleURLs = useMemo(() => {
    if (!managedClusters || !Array.isArray(managedClusters)) {
      return {};
    }

    return managedClusters.reduce<Record<string, string>>((acc, cluster) => {
      const clusterName = cluster?.metadata?.name;
      const consoleURLClaim = cluster?.status?.clusterClaims?.find(
        (claim) => claim.name === CONSOLE_URL_CLAIM,
      );

      if (clusterName && consoleURLClaim?.value) {
        acc[clusterName] = consoleURLClaim.value;
      }

      return acc;
    }, {});
  }, [managedClusters]);

  const getConsoleURL = useCallback(
    (clusterName: string): string | undefined => {
      // Hub cluster doesn't need external URL - use current console
      if (!clusterName || clusterName === hubClusterName) {
        return undefined;
      }
      return consoleURLs[clusterName];
    },
    [hubClusterName, consoleURLs],
  );

  return {
    consoleURLs,
    error,
    getConsoleURL,
    loaded,
  };
};

export default useManagedClusterConsoleURLs;
