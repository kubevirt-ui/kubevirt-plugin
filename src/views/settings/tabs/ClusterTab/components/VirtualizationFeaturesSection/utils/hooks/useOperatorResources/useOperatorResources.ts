import { useMemo } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import { operatorPackageNames } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import {
  EMPTY_OPERATOR_GROUPS,
  EMPTY_SUBSCRIPTIONS,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useOperatorResources/utils/constants';
import {
  type BaseOperatorWatchResources,
  type UseOperatorResourcesReturn,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useOperatorResources/utils/types';
import { getBaseOperatorWatchResources } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useOperatorResources/utils/utils';

import useOperatorCsvs from './useOperatorCsvs';
import usePackageManifests from './usePackageManifests';

const useOperatorResources = (
  packageNames: readonly string[] = operatorPackageNames,
): UseOperatorResourcesReturn => {
  const cluster = useSettingsCluster();
  const memoizedPackageNames = useDeepCompareMemoize(packageNames);

  const {
    loadErrors: packageManifestLoadErrors,
    loaded: packageManifestsLoaded,
    packageManifests: filteredPackageManifests,
  } = usePackageManifests({ cluster, packageNames: memoizedPackageNames });

  const baseResources = useMemo(() => getBaseOperatorWatchResources(cluster), [cluster]);
  const baseData = useKubevirtWatchResources<BaseOperatorWatchResources>(baseResources);

  const { operatorGroups: operatorGroupsWatch, subscriptions: subscriptionsWatch } = baseData ?? {};

  const operatorGroups = useMemo(
    () => operatorGroupsWatch?.data ?? EMPTY_OPERATOR_GROUPS,
    [operatorGroupsWatch?.data],
  );

  const subscriptions = useMemo(
    () => subscriptionsWatch?.data ?? EMPTY_SUBSCRIPTIONS,
    [subscriptionsWatch?.data],
  );

  const baseResourcesLoaded = useMemo(
    () => packageManifestsLoaded && operatorGroupsWatch?.loaded && subscriptionsWatch?.loaded,
    [operatorGroupsWatch?.loaded, packageManifestsLoaded, subscriptionsWatch?.loaded],
  );

  const {
    clusterServiceVersions,
    loadErrors: csvLoadErrors,
    loaded: csvResourcesLoaded,
  } = useOperatorCsvs({
    cluster,
    enabled: baseResourcesLoaded,
    operatorGroups,
    packageManifests: filteredPackageManifests,
    subscriptions,
  });

  const operatorResourcesLoaded = baseResourcesLoaded && csvResourcesLoaded;

  const loadErrors = useMemo(
    () =>
      [
        ...packageManifestLoadErrors,
        operatorGroupsWatch?.loadError,
        subscriptionsWatch?.loadError,
        ...csvLoadErrors,
      ].filter(Boolean),
    [
      csvLoadErrors,
      operatorGroupsWatch?.loadError,
      packageManifestLoadErrors,
      subscriptionsWatch?.loadError,

      csvLoadErrors,
      operatorGroupsWatch?.loadError,
      packageManifestLoadErrors,
      subscriptionsWatch?.loadError,
    ],
  );

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
