import { useMemo } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { ManagedClusterModel } from '@multicluster/constants';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { useClusterCNVInstalled } from './useClusterCNVInstalled';

type K8sResourceList = K8sResourceCommon & {
  items: K8sResourceCommon[];
};

/**
 * Type guard to check if data is a K8s list object with an items array.
 * Kubernetes API list responses can be either an array directly or an object
 * with an `items` property containing the array.
 *
 * @param data - The data to check, which can be a K8sResourceCommon object,
 *               an array of K8sResourceCommon, or undefined
 * @returns True if data is a K8sResourceCommon object with an `items` array property,
 *          false otherwise
 */
const isK8sResourceList = (
  data: K8sResourceCommon | K8sResourceCommon[] | undefined,
): data is K8sResourceList => {
  return (
    data !== undefined &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    'items' in data &&
    Array.isArray((data as K8sResourceList).items)
  );
};

/**
 * Get a list of clusters with observability disabled
 * by checking for the `observability=disabled` label on ManagedCluster resources
 * @param onlyCNVClusters - If true, filter enabledClusters to only include clusters with CNV installed
 */
export const useClusterObservabilityDisabled = (
  onlyCNVClusters = false,
): {
  disabledClusters: string[];
  enabledClusters: string[];
  error: Error | unknown;
  loaded: boolean;
} => {
  // Get list of all ManagedClusters
  const [managedClusterData, loaded, loadError] = useK8sWatchData<
    K8sResourceCommon | K8sResourceCommon[]
  >({
    groupVersionKind: modelToGroupVersionKind(ManagedClusterModel),
    isList: true,
  });

  const { cnvInstalledClusters, loaded: cnvLoaded } = useClusterCNVInstalled();

  // Parse the list to get clusters with observability enabled and disabled
  const { disabledClusters, enabledClusters: rawEnabledClusters } = useMemo(() => {
    if (!managedClusterData) {
      return { disabledClusters: [], enabledClusters: [] };
    }

    // Handle both array and list object with items property
    let clusters: K8sResourceCommon[];
    if (Array.isArray(managedClusterData)) {
      clusters = managedClusterData;
    } else if (isK8sResourceList(managedClusterData)) {
      clusters = managedClusterData.items;
    } else {
      clusters = [];
    }

    if (!Array.isArray(clusters) || clusters.length === 0) {
      return { disabledClusters: [], enabledClusters: [] };
    }

    const disabled: string[] = [];
    const enabled: string[] = [];

    clusters.forEach((mc) => {
      const clusterName = mc?.metadata?.name;
      if (!clusterName) return;

      const observabilityDisabled = mc?.metadata?.labels?.observability === 'disabled';
      if (observabilityDisabled) {
        disabled.push(clusterName);
      } else {
        enabled.push(clusterName);
      }
    });

    return { disabledClusters: disabled, enabledClusters: enabled };
  }, [managedClusterData]);

  // Filter enabled clusters to only include CNV-installed clusters if onlyCNVClusters is true
  const enabledClusters = useMemo(() => {
    if (!onlyCNVClusters || !cnvLoaded) {
      return rawEnabledClusters;
    }
    return rawEnabledClusters.filter((clusterName) => cnvInstalledClusters.includes(clusterName));
  }, [onlyCNVClusters, cnvLoaded, rawEnabledClusters, cnvInstalledClusters]);

  return {
    disabledClusters,
    enabledClusters,
    error: loadError,
    loaded: onlyCNVClusters ? loaded && cnvLoaded : loaded,
  };
};
