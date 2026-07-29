import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type PackageManifestKind } from '@overview/utils/types';
import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { isInstalled } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { VirtFeatureOperatorItem } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/types';
import { getPackageUID } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/utils';
import { RED_HAT } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/constants';

import {
  type CapabilityFeature,
  CapabilityInstallState,
  type RecommendedCapabilityDetailsMap,
} from './types';

export const getBundleFeatures = (features: CapabilityFeature[]): CapabilityFeature[] =>
  features.filter(({ isDefaultBundle }) => isDefaultBundle);

export const computeCapabilityInstallState = (
  feature: CapabilityFeature,
  detailsMap: RecommendedCapabilityDetailsMap,
): CapabilityInstallState => {
  if (isEmpty(detailsMap)) return CapabilityInstallState.NotInstalled;

  const satisfiedCount = feature.operators.filter(({ packageName }) => {
    const details = detailsMap[packageName];
    return details?.isRedHatProvided && isInstalled(details.installState);
  }).length;

  if (satisfiedCount === feature.operators.length) return CapabilityInstallState.Installed;
  if (satisfiedCount > 0) return CapabilityInstallState.PartiallyInstalled;
  return CapabilityInstallState.NotInstalled;
};

export const countInstalledCapabilities = (
  features: CapabilityFeature[],
  detailsMap: RecommendedCapabilityDetailsMap,
): number =>
  features.filter(
    (feature) =>
      computeCapabilityInstallState(feature, detailsMap) === CapabilityInstallState.Installed,
  ).length;

const getNonInstalledManifests = (
  packageNames: Set<string>,
  detailsMap: RecommendedCapabilityDetailsMap,
  filteredPackageManifests: PackageManifestKind[],
): PackageManifestKind[] => {
  const seen = new Set<string>();

  return filteredPackageManifests.filter((pkg) => {
    const name = getName(pkg);
    if (!packageNames.has(name)) return false;
    if (detailsMap[name]?.installState !== InstallState.NOT_INSTALLED) return false;
    if (!pkg.status?.provider?.name?.includes(RED_HAT)) return false;
    return seen.has(name) ? false : (seen.add(name), true);
  });
};

export const getNonInstalledBundleManifests = (
  features: CapabilityFeature[],
  detailsMap: RecommendedCapabilityDetailsMap,
  filteredPackageManifests: PackageManifestKind[],
): PackageManifestKind[] => {
  const bundlePackageNames = new Set(
    getBundleFeatures(features).flatMap(({ operators }) =>
      operators.map(({ packageName }) => packageName),
    ),
  );

  return getNonInstalledManifests(bundlePackageNames, detailsMap, filteredPackageManifests);
};

export const getNonInstalledFeatureManifests = (
  feature: CapabilityFeature,
  detailsMap: RecommendedCapabilityDetailsMap,
  filteredPackageManifests: PackageManifestKind[],
): PackageManifestKind[] => {
  const featurePackageNames = new Set(feature.operators.map(({ packageName }) => packageName));

  return getNonInstalledManifests(featurePackageNames, detailsMap, filteredPackageManifests);
};

export const packageManifestToOperatorItem = (
  pkg: PackageManifestKind,
): VirtFeatureOperatorItem => ({
  name: getName(pkg),
  obj: pkg,
  uid: getPackageUID(pkg),
});
