import { useMemo } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import { ManagedClusterModel } from '@multicluster/constants';
import useIsACMPage from '@multicluster/useIsACMPage';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { useClusterCNVInstalled } from './useClusterCNVInstalled';
import { getMCONotInstalledTooltip, useMCOInstalled } from './useMCOInstalled';

export { getMCONotInstalledTooltip };

type K8sResourceList = K8sResourceCommon & {
  items: K8sResourceCommon[];
};

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

export const useClusterObservabilityDisabled = (
  onlyCNVClusters = false,
): {
  disabledClusters: string[];
  enabledClusters: string[];
  error: Error | unknown;
  loaded: boolean;
  mcoInstalled: boolean;
} => {
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();

  const [managedClusterData, loaded, loadError] = useKubevirtWatchResource<
    K8sResourceCommon | K8sResourceCommon[]
  >({
    cluster: hubClusterName,
    groupVersionKind: modelToGroupVersionKind(ManagedClusterModel),
    isList: true,
  });

  const { cnvInstalledClusters, loaded: cnvLoaded } = useClusterCNVInstalled();
  const { loaded: mcoLoaded, mcoInstalled } = useMCOInstalled();

  const {
    allClusterNames,
    disabledClusters,
    enabledClusters: rawEnabledClusters,
  } = useMemo(() => {
    if (!isACMPage || !managedClusterData) {
      return { allClusterNames: [], disabledClusters: [], enabledClusters: [] };
    }

    let clusters: K8sResourceCommon[];
    if (Array.isArray(managedClusterData)) {
      clusters = managedClusterData;
    } else if (isK8sResourceList(managedClusterData)) {
      clusters = managedClusterData.items;
    } else {
      clusters = [];
    }

    if (clusters.length === 0) {
      return { allClusterNames: [], disabledClusters: [], enabledClusters: [] };
    }

    const all: string[] = [];
    const disabled: string[] = [];
    const enabled: string[] = [];

    clusters.forEach((mc) => {
      const clusterName = getName(mc);
      if (!clusterName) return;

      all.push(clusterName);
      const observabilityDisabled = getLabel(mc, 'observability') === 'disabled';
      if (observabilityDisabled) {
        disabled.push(clusterName);
      } else {
        enabled.push(clusterName);
      }
    });

    return { allClusterNames: all, disabledClusters: disabled, enabledClusters: enabled };
  }, [isACMPage, managedClusterData]);

  // When MCO is not installed, only the hub cluster should be enabled
  // All spoke clusters should be disabled
  const enabledClustersWithMCO = useMemo(() => {
    if (!mcoLoaded) {
      return rawEnabledClusters;
    }

    if (!mcoInstalled) {
      // When MCO is not installed, only the hub cluster is enabled
      return hubClusterName ? [hubClusterName] : [];
    }

    return rawEnabledClusters;
  }, [mcoLoaded, mcoInstalled, rawEnabledClusters, hubClusterName]);

  // When MCO is not installed, all clusters except hub are disabled
  const disabledClustersWithMCO = useMemo(() => {
    if (!mcoLoaded) {
      return disabledClusters;
    }

    if (!mcoInstalled) {
      // All clusters except hub are disabled when MCO is not installed
      return allClusterNames.filter((name) => name !== hubClusterName);
    }

    return disabledClusters;
  }, [mcoLoaded, mcoInstalled, disabledClusters, allClusterNames, hubClusterName]);

  const enabledClusters = useMemo(() => {
    if (!onlyCNVClusters || !cnvLoaded) {
      return enabledClustersWithMCO;
    }
    return enabledClustersWithMCO.filter((clusterName) =>
      cnvInstalledClusters.includes(clusterName),
    );
  }, [onlyCNVClusters, cnvLoaded, enabledClustersWithMCO, cnvInstalledClusters]);

  // For non-ACM pages, return loaded=true immediately to avoid blocking consumers
  if (!isACMPage) {
    return {
      disabledClusters: [],
      enabledClusters: [],
      error: undefined,
      loaded: true,
      mcoInstalled: true,
    };
  }

  const allLoaded = onlyCNVClusters ? loaded && cnvLoaded && mcoLoaded : loaded && mcoLoaded;

  return {
    disabledClusters: disabledClustersWithMCO,
    enabledClusters,
    error: loadError,
    loaded: allLoaded,
    mcoInstalled,
  };
};
