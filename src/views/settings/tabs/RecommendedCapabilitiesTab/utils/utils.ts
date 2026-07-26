import { isNil } from 'lodash';

import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  type ClusterServiceVersionKind,
  ClusterServiceVersionPhase,
  type OperatorGroupKind,
  type PackageManifestKind,
  type SubscriptionKind,
} from '@overview/utils/types';

import { INSTALL_SUCCEEDED_STATUS, RED_HAT } from './constants';
import {
  type CapabilityFeature,
  CapabilityInstallState,
  InstallState,
  type RecommendedCapabilityDetailsMap,
  type VirtFeatureOperatorItem,
} from './types';

export const isInstalled = (installState: InstallState): boolean =>
  installState === InstallState.INSTALLED;

export const getPackageUID = (pkg: PackageManifestKind) =>
  `${pkg.metadata.name}-${pkg.status.catalogSource}-${pkg.status.catalogSourceNamespace}`;

export const clusterServiceVersionFor = (
  clusterServiceVersions: ClusterServiceVersionKind[],
  csvName: string,
): ClusterServiceVersionKind =>
  clusterServiceVersions?.find((csv) => csv && getName(csv) === csvName);

export const getSubscriptionInstalledCSV = (subscription: SubscriptionKind): string | undefined =>
  subscription?.status?.installedCSV ?? subscription?.status?.currentCSV;

export const subscriptionFor = (
  allSubscriptions: SubscriptionKind[] = [],
  allGroups: OperatorGroupKind[] = [],
  pkg: PackageManifestKind,
) =>
  allSubscriptions
    .filter(
      (sub) =>
        sub.spec.name === pkg.status.packageName &&
        sub.spec.sourceNamespace === pkg.status.catalogSourceNamespace,
    )
    .find((sub) => allGroups.some((og) => og.metadata.namespace === sub.metadata.namespace));

export const getOperatorHubURL = (uid: string, namespace: string) =>
  `/catalog/ns/${namespace || 'default'}?selectedId=${uid}`;

export const computeInstallState = (
  csv: ClusterServiceVersionKind,
  subscription: SubscriptionKind,
) => {
  const installPhase = csv?.status?.phase;
  const installInProgress =
    !isNil(subscription) &&
    !isNil(csv?.status?.phase) &&
    csv?.status?.phase !== INSTALL_SUCCEEDED_STATUS;

  if (installPhase === ClusterServiceVersionPhase.CSVPhaseSucceeded) return InstallState.INSTALLED;
  if (installPhase === ClusterServiceVersionPhase.CSVPhaseFailed) return InstallState.FAILED;
  if (installInProgress) return InstallState.INSTALLING;
  if (subscription?.status?.installedCSV) return InstallState.INSTALLED;
  return InstallState.NOT_INSTALLED;
};

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
