/* eslint-disable */
import { isNil } from 'lodash';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  type ClusterServiceVersionKind,
  ClusterServiceVersionPhase,
  type SubscriptionKind,
} from '@overview/utils/types';

import {
  type CapabilityFeature,
  CapabilityInstallState,
  InstallState,
  type RecommendedCapabilityDetailsMap,
} from './types';

const INSTALL_SUCCEEDED_STATUS = 'Succeeded';

export const isInstalled = (installState: InstallState): boolean =>
  installState === InstallState.INSTALLED;

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
