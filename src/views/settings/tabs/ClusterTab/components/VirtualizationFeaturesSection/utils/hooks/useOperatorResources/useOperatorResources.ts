import { useMemo } from 'react';

import { getName } from '@kubevirt-utils/resources/shared';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';
import {
  ClusterServiceVersionKind,
  OperatorGroupKind,
  PackageManifestKind,
  SubscriptionKind,
} from '@overview/utils/types';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import { operatorPackageNames } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { OperatorResources } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useOperatorResources/utils/types';
import { getWatchedOperatorResources } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useOperatorResources/utils/utils';

export type UseOperatorResourcesReturn = {
  clusterServiceVersions: ClusterServiceVersionKind[];
  filteredPackageManifests: PackageManifestKind[];
  loadErrors: unknown[];
  operatorGroups: OperatorGroupKind[];
  operatorResourcesLoaded: boolean;
  subscriptions: SubscriptionKind[];
};

const useOperatorResources = (
  packageNames: readonly string[] = operatorPackageNames,
): UseOperatorResourcesReturn => {
  const cluster = useSettingsCluster();
  const resources = useMemo(() => getWatchedOperatorResources(cluster), [cluster]);
  const data = useKubevirtWatchResources<OperatorResources>(resources);

  const clusterServiceVersions = data?.clusterServiceVersions?.data ?? [];
  const operatorGroups = data?.operatorGroups?.data ?? [];
  const subscriptions = data?.subscriptions?.data ?? [];

  const filteredPackageManifests = (data?.allPackageManifests?.data ?? []).filter((pkg) =>
    packageNames.includes(getName(pkg)),
  );

  const operatorResourcesLoaded =
    data?.allPackageManifests?.loaded &&
    data?.clusterServiceVersions?.loaded &&
    data?.operatorGroups?.loaded &&
    data?.subscriptions?.loaded;

  const loadErrors = [
    data?.allPackageManifests?.loadError,
    data?.clusterServiceVersions?.loadError,
    data?.operatorGroups?.loadError,
    data?.subscriptions?.loadError,
  ].filter(Boolean);

  return {
    clusterServiceVersions,
    filteredPackageManifests,
    loadErrors,
    operatorGroups,
    operatorResourcesLoaded,
    subscriptions,
  };
};

export default useOperatorResources;
