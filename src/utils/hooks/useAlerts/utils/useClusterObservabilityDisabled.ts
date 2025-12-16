import { useMemo } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import { ManagedClusterModel } from '@multicluster/constants';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { useClusterCNVInstalled } from './useClusterCNVInstalled';

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
} => {
  const [hubClusterName] = useHubClusterName();

  const [managedClusterData, loaded, loadError] = useKubevirtWatchResource<
    K8sResourceCommon | K8sResourceCommon[]
  >({
    cluster: hubClusterName,
    groupVersionKind: modelToGroupVersionKind(ManagedClusterModel),
    isList: true,
  });

  const { cnvInstalledClusters, loaded: cnvLoaded } = useClusterCNVInstalled();

  const { disabledClusters, enabledClusters: rawEnabledClusters } = useMemo(() => {
    if (!managedClusterData) {
      return { disabledClusters: [], enabledClusters: [] };
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
      return { disabledClusters: [], enabledClusters: [] };
    }

    const disabled: string[] = [];
    const enabled: string[] = [];

    clusters.forEach((mc) => {
      const clusterName = getName(mc);
      if (!clusterName) return;

      const observabilityDisabled = getLabel(mc, 'observability') === 'disabled';
      if (observabilityDisabled) {
        disabled.push(clusterName);
      } else {
        enabled.push(clusterName);
      }
    });

    return { disabledClusters: disabled, enabledClusters: enabled };
  }, [managedClusterData]);

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
