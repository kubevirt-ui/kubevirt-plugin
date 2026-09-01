/* eslint-disable */
import { getName } from '@kubevirt-utils/resources/shared';
import {
  type ClusterServiceVersionKind,
  type OperatorGroupKind,
  type PackageManifestKind,
  type SubscriptionKind,
} from '@overview/utils/types';

import { RED_HAT } from './constants';
import { getBundleFeatures } from './installState';
import {
  type CapabilityFeature,
  InstallState,
  type RecommendedCapabilityDetailsMap,
  type VirtFeatureOperatorItem,
} from './types';

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
