import { getName } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { operatorPackageNames } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { OperatorResources } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useOperatorResources/utils/types';
import { watchedOperatorResources } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useOperatorResources/utils/utils';
import {
  ClusterServiceVersionKind,
  OperatorGroupKind,
  PackageManifestKind,
  SubscriptionKind,
} from '@overview/utils/types';

type UseOperatorResources = () => {
  clusterServiceVersions: ClusterServiceVersionKind[];
  filteredPackageManifests: PackageManifestKind[];
  operatorGroups: OperatorGroupKind[];
  operatorResourcesLoaded: boolean;
  subscriptions: SubscriptionKind[];
};

const useOperatorResources: UseOperatorResources = () => {
  const data = useK8sWatchResources<OperatorResources>(watchedOperatorResources);

  const clusterServiceVersions = data?.clusterServiceVersions?.data;
  const operatorGroups = data?.operatorGroups?.data;
  const marketplacePackageManifests = data?.marketplacePackageManifests?.data;
  const packageManifests = data?.packageManifests?.data;
  const subscriptions = data?.subscriptions?.data;

  const allPackageManifests = [...packageManifests, ...marketplacePackageManifests];
  const filteredPackageManifests = allPackageManifests.filter((pkg) =>
    operatorPackageNames.includes(getName(pkg)),
  );

  const operatorResourcesLoaded =
    data?.clusterServiceVersions?.loaded &&
    data?.packageManifests?.loaded &&
    data?.marketplacePackageManifests?.loaded &&
    data?.operatorGroups?.loaded &&
    data?.subscriptions?.loaded;

  return {
    clusterServiceVersions,
    filteredPackageManifests,
    operatorGroups,
    operatorResourcesLoaded,
    subscriptions,
  };
};

export default useOperatorResources;
