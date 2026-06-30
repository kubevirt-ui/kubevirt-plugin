import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type OperatorGroupKind, type SubscriptionKind } from '@overview/utils/types';
import { type LabelProps } from '@patternfly/react-core';
import { type UseOperatorResourcesReturn } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useOperatorResources/useOperatorResources';
import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { isInstalled } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import {
  clusterServiceVersionFor,
  computeInstallState,
  getOperatorHubURL,
  getPackageUID,
  getSubscriptionInstalledCSV,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/utils';

import { RECOMMENDED_OPERATOR_PACKAGE_NAMES } from './operatorNames';
import {
  type AlternativeStateMap,
  type CapabilityFeature,
  CapabilityInstallState,
  type RecommendedCapabilityDetailsMap,
  type RecommendedCapabilityOperatorDetails,
} from './types';

const defaultOperatorDetails: RecommendedCapabilityOperatorDetails = {
  installState: InstallState.NOT_INSTALLED,
  operatorHubURL: undefined,
};

const findSubscriptionByPackageName = (
  allSubscriptions: SubscriptionKind[],
  allGroups: OperatorGroupKind[],
  packageName: string,
): SubscriptionKind | undefined =>
  allSubscriptions.find(
    (sub) =>
      getName(sub) === packageName &&
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
  const detailsMap = filteredPackageManifests.reduce<RecommendedCapabilityDetailsMap>(
    (map, pkg) => {
      const packageName = getName(pkg);
      if (packageName in map) return map;

      const subscription = operatorResourcesLoaded
        ? findSubscriptionByPackageName(subscriptions, operatorGroups, packageName)
        : undefined;
      const csv = operatorResourcesLoaded
        ? clusterServiceVersionFor(
            clusterServiceVersions,
            getSubscriptionInstalledCSV(subscription),
          )
        : undefined;

      map[packageName] = {
        installState: operatorResourcesLoaded
          ? computeInstallState(csv, subscription)
          : InstallState.NOT_INSTALLED,
        operatorHubURL: getOperatorHubURL(getPackageUID(pkg), namespace),
      };

      return map;
    },
    {},
  );

  const missingOperators = RECOMMENDED_OPERATOR_PACKAGE_NAMES.filter((name) => !detailsMap[name]);

  return {
    ...Object.fromEntries(missingOperators.map((name) => [name, defaultOperatorDetails])),
    ...detailsMap,
  };
};

export const computeCapabilityInstallState = (
  feature: CapabilityFeature,
  detailsMap: RecommendedCapabilityDetailsMap,
  alternativeState: AlternativeStateMap,
): CapabilityInstallState => {
  if (isEmpty(detailsMap)) return CapabilityInstallState.NotInstalled;

  const satisfiedCount = feature.operators.filter(
    (operator) =>
      isInstalled(detailsMap[operator.packageName]?.installState) ||
      alternativeState[operator.packageName],
  ).length;

  if (satisfiedCount === feature.operators.length) return CapabilityInstallState.Installed;
  if (satisfiedCount > 0) return CapabilityInstallState.PartiallyInstalled;
  return CapabilityInstallState.NotInstalled;
};

export const CAPABILITY_INSTALL_STATE_CONFIG: Record<
  CapabilityInstallState,
  { color: LabelProps['color']; labelKey: string }
> = {
  [CapabilityInstallState.Installed]: { color: 'green', labelKey: 'Installed' },
  [CapabilityInstallState.NotInstalled]: { color: 'orange', labelKey: 'Not installed' },
  [CapabilityInstallState.PartiallyInstalled]: { color: 'grey', labelKey: 'Partially installed' },
};
