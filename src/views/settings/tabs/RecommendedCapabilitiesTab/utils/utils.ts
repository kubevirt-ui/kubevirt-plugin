import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type PackageManifestKind } from '@overview/utils/types';
import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { isInstalled } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { VirtFeatureOperatorItem } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/types';
import { getPackageUID } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/utils';

import {
  type AlternativeStateMap,
  type CapabilityFeature,
  CapabilityInstallState,
  type RecommendedCapabilityDetailsMap,
} from './types';

export const isBundleFeature = ({ isDefaultBundle }: CapabilityFeature): boolean => isDefaultBundle;

export const computeCapabilityInstallState = (
  feature: CapabilityFeature,
  detailsMap: RecommendedCapabilityDetailsMap,
  alternativeState: AlternativeStateMap,
): CapabilityInstallState => {
  if (isEmpty(detailsMap)) return CapabilityInstallState.NotInstalled;

  const satisfiedCount = feature.operators.filter(
    ({ packageName }) =>
      isInstalled(detailsMap[packageName]?.installState) || alternativeState[packageName],
  ).length;

  if (satisfiedCount === feature.operators.length) return CapabilityInstallState.Installed;
  if (satisfiedCount > 0) return CapabilityInstallState.PartiallyInstalled;
  return CapabilityInstallState.NotInstalled;
};

export const countInstalledBundleCapabilities = (
  features: CapabilityFeature[],
  detailsMap: RecommendedCapabilityDetailsMap,
  alternativeState: AlternativeStateMap,
): number =>
  features
    .filter(isBundleFeature)
    .filter(
      (feature) =>
        computeCapabilityInstallState(feature, detailsMap, alternativeState) ===
        CapabilityInstallState.Installed,
    ).length;

export const getNonInstalledBundleManifests = (
  features: CapabilityFeature[],
  detailsMap: RecommendedCapabilityDetailsMap,
  filteredPackageManifests: PackageManifestKind[],
): PackageManifestKind[] => {
  const defaultBundlePackageNames = new Set(
    features
      .filter(isBundleFeature)
      .flatMap(({ operators }) => operators.map(({ packageName }) => packageName)),
  );

  const seen = new Set<string>();

  return filteredPackageManifests.filter((pkg) => {
    const name = getName(pkg);
    if (!defaultBundlePackageNames.has(name)) return false;
    if (detailsMap[name]?.installState !== InstallState.NOT_INSTALLED) return false;
    return seen.has(name) ? false : (seen.add(name), true);
  });
};

export const packageManifestToOperatorItem = (
  pkg: PackageManifestKind,
): VirtFeatureOperatorItem => ({
  name: getName(pkg),
  obj: pkg,
  uid: getPackageUID(pkg),
});
