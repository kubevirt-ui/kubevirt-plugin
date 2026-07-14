import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { type OperatorGroupKind, type SubscriptionKind } from '@overview/utils/types';
import { type UseOperatorResourcesReturn } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useOperatorResources/utils/types';
import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import {
  clusterServiceVersionFor,
  computeInstallState,
  getOperatorHubURL,
  getPackageUID,
  getSubscriptionInstalledCSV,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/utils';

import { RECOMMENDED_OPERATOR_PACKAGE_NAMES } from './operatorNames';
import {
  type RecommendedCapabilityDetailsMap,
  type RecommendedCapabilityOperatorDetails,
} from './types';

const findSubscriptionByPackageName = (
  allSubscriptions: SubscriptionKind[],
  allGroups: OperatorGroupKind[],
  packageName: string,
): SubscriptionKind | undefined =>
  allSubscriptions.find(
    (sub) =>
      sub.spec.name === packageName &&
      allGroups.some((operatorGroup) => getNamespace(operatorGroup) === getNamespace(sub)),
  );

export const buildRecommendedDetailsMap = (
  clusterServiceVersions: UseOperatorResourcesReturn['clusterServiceVersions'],
  filteredPackageManifests: UseOperatorResourcesReturn['filteredPackageManifests'],
  operatorGroups: UseOperatorResourcesReturn['operatorGroups'],
  operatorResourcesLoaded: UseOperatorResourcesReturn['operatorResourcesLoaded'],
  subscriptions: UseOperatorResourcesReturn['subscriptions'],
  namespace: string,
): RecommendedCapabilityDetailsMap => {
  const resolveInstallState = (packageName: string): InstallState => {
    if (!operatorResourcesLoaded) return InstallState.NOT_INSTALLED;
    const subscription = findSubscriptionByPackageName(subscriptions, operatorGroups, packageName);
    const csvName = getSubscriptionInstalledCSV(subscription) ?? subscription?.status?.currentCSV;
    const csv = clusterServiceVersionFor(clusterServiceVersions, csvName);
    return computeInstallState(csv, subscription);
  };

  const detailsMap = filteredPackageManifests.reduce<RecommendedCapabilityDetailsMap>(
    (map, pkg) => {
      const packageName = getName(pkg);
      if (packageName in map) return map;
      map[packageName] = {
        installState: resolveInstallState(packageName),
        operatorHubURL: getOperatorHubURL(getPackageUID(pkg), namespace),
      };
      return map;
    },
    {},
  );

  const missingOperators = RECOMMENDED_OPERATOR_PACKAGE_NAMES.filter((name) => !detailsMap[name]);

  const missingOperatorsMap = Object.fromEntries(
    missingOperators.map((name) => [
      name,
      {
        installState: resolveInstallState(name),
        operatorHubURL: undefined,
      } as RecommendedCapabilityOperatorDetails,
    ]),
  );

  return {
    ...missingOperatorsMap,
    ...detailsMap,
  };
};
