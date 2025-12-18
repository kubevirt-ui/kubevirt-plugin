import { useEffect } from 'react';

import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';

type UseDisabledClusterRedirectProps = {
  cluster: string;
  clusterNames: string[];
  clustersLoaded: boolean;
  cnvLoaded: boolean;
  cnvNotInstalledClusters: string[];
  disabledClusters: string[];
  hubClusterName: string;
  hubClusterNameLoaded: boolean;
  includeAllClusters: boolean;
  isACMPage: boolean;
  onClusterChange: (cluster: string) => void;
  onlyCNVClusters: boolean;
};

export const useDisabledClusterRedirect = ({
  cluster,
  clusterNames,
  clustersLoaded,
  cnvLoaded,
  cnvNotInstalledClusters,
  disabledClusters,
  hubClusterName,
  hubClusterNameLoaded,
  includeAllClusters,
  isACMPage,
  onClusterChange,
  onlyCNVClusters,
}: UseDisabledClusterRedirectProps): void => {
  useEffect(() => {
    if (!isACMPage) return;
    if (
      !clustersLoaded ||
      !clusterNames ||
      !cluster ||
      cluster === ALL_CLUSTERS_KEY ||
      !disabledClusters ||
      disabledClusters.length === 0
    ) {
      return;
    }

    const isCurrentClusterDisabled = disabledClusters.includes(cluster);
    if (!isCurrentClusterDisabled) {
      return;
    }

    // Find first enabled cluster
    const omittedSet = new Set(onlyCNVClusters && cnvLoaded ? cnvNotInstalledClusters : []);
    const disabledSet = new Set(disabledClusters);

    // If includeAllClusters is true, prefer "all clusters"
    if (includeAllClusters) {
      onClusterChange(ALL_CLUSTERS_KEY);
      return;
    }

    // Otherwise, find first enabled cluster
    const enabledCluster = clusterNames?.find(
      (name) => !omittedSet.has(name) && !disabledSet.has(name),
    );

    const redirectTo = (next: string | undefined): void => {
      if (next && next !== cluster) {
        onClusterChange(next);
      }
    };

    if (enabledCluster) {
      redirectTo(enabledCluster);
    } else if (
      hubClusterNameLoaded &&
      hubClusterName &&
      !omittedSet.has(hubClusterName) &&
      !disabledSet.has(hubClusterName)
    ) {
      // Fallback to hub cluster only if it is enabled and not CNV-omitted
      redirectTo(hubClusterName);
    }
  }, [
    isACMPage,
    cluster,
    clustersLoaded,
    clusterNames,
    cnvLoaded,
    cnvNotInstalledClusters,
    disabledClusters,
    hubClusterName,
    hubClusterNameLoaded,
    includeAllClusters,
    onlyCNVClusters,
    onClusterChange,
  ]);
};
