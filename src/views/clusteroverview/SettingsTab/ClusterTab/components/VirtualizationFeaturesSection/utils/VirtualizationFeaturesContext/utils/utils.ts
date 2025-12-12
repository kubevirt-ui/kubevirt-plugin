import { isNil } from 'lodash';

import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';
import {
  CLUSTER_OBSERVABILITY_OPERATOR_NAME,
  DESCHEDULER_OPERATOR_NAME,
  FENCE_AGENTS_OPERATOR_NAME,
  NETOBSERV_OPERATOR_NAME,
  NMSTATE_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
  operatorPackageNames,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import {
  InstallState,
  OperatorsToInstall,
  VirtualizationFeatureOperators,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import {
  installFailed,
  isInstalled,
  isInstalling,
  isNotInstalled,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { INSTALL_SUCCEEDED_STATUS } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/constants';
import {
  ClusterServiceVersionKind,
  ClusterServiceVersionPhase,
  OperatorGroupKind,
  PackageManifestKind,
  SubscriptionKind,
} from '@overview/utils/types';

import {
  DefaultCatalogSource,
  OperatorDetails,
  OperatorDetailsMap,
  PackageSource,
  ParseJSONAnnotationOptions,
  VirtFeatureOperatorItem,
  VirtFeatureOperatorItemsMap,
} from './types';

export const isArrayOfStrings = (value: any): value is string[] =>
  Array.isArray(value) && !value.some((element) => typeof element !== 'string');

export const parseJSONAnnotation = <T = any>(
  annotations: ObjectMetadata['annotations'],
  key: string,
  options: ParseJSONAnnotationOptions,
): T => {
  const { onError, validate } = options ?? {};
  const annotation = annotations?.[key];
  if (!annotation) {
    return null;
  }
  try {
    const parsed: T = JSON.parse(annotation);
    const valid = validate?.(parsed) ?? true;
    if (!valid) {
      throw new Error(`Invalid value: "${annotation}"`);
    }
    return parsed;
  } catch (e) {
    onError?.(e.message);
    return null;
  }
};

/**
 * Determines if a given Operator package has a `Subscription` that makes it available in the given namespace.
 * Finds any `Subscriptions` for the given package, matches them to their `OperatorGroup`, and checks if the `OperatorGroup` is targeting the given namespace or if it is global.
 */
export const subscriptionFor = (
  allSubscriptions: SubscriptionKind[] = [],
  allGroups: OperatorGroupKind[] = [],
  pkg: PackageManifestKind,
) =>
  allSubscriptions
    .filter(
      (sub) =>
        sub.spec.name === pkg.status.packageName &&
        sub.spec.source === pkg.status.catalogSource &&
        sub.spec.sourceNamespace === pkg.status.catalogSourceNamespace,
    )
    .find((sub) => allGroups.some((og) => og.metadata.namespace === sub.metadata.namespace));

export const clusterServiceVersionFor = (
  clusterServiceVersions: ClusterServiceVersionKind[],
  csvName: string,
): ClusterServiceVersionKind =>
  clusterServiceVersions?.find((csv) => csv.metadata.name === csvName);

export const defaultPackageSourceMap = {
  [DefaultCatalogSource.CertifiedOperators]: PackageSource.CertifiedOperators,
  [DefaultCatalogSource.CommunityOperators]: PackageSource.CommunityOperators,
  [DefaultCatalogSource.RedHatMarketPlace]: PackageSource.RedHatMarketplace,
  [DefaultCatalogSource.RedHatOperators]: PackageSource.RedHatOperators,
};

export const getPackageSource = (packageManifest: PackageManifestKind): PackageSource => {
  const { catalogSource, catalogSourceDisplayName } = packageManifest?.status ?? {};
  return defaultPackageSourceMap?.[catalogSource] || catalogSourceDisplayName || catalogSource;
};

const defaultOperatorData: OperatorDetails = {
  installState: undefined,
  operatorHubURL: undefined,
};

export const defaultVirtFeatureOperatorItemsMap = {
  [CLUSTER_OBSERVABILITY_OPERATOR_NAME]: defaultOperatorData,
  [DESCHEDULER_OPERATOR_NAME]: defaultOperatorData,
  [FENCE_AGENTS_OPERATOR_NAME]: defaultOperatorData,
  [NETOBSERV_OPERATOR_NAME]: defaultOperatorData,
  [NMSTATE_OPERATOR_NAME]: defaultOperatorData,
  [NODE_HEALTH_OPERATOR_NAME]: defaultOperatorData,
};

export const getPackageUID = (pkg: PackageManifestKind) =>
  `${pkg.metadata.name}-${pkg.status.catalogSource}-${pkg.status.catalogSourceNamespace}`;

export const groupOperatorItems = (items: VirtFeatureOperatorItem[]): VirtFeatureOperatorItemsMap =>
  items.reduce((acc, item) => {
    if (getPackageSource(item?.obj) !== 'Red Hat' && !isInstalled(item?.installState)) return acc;

    const operatorName = getName(item?.obj);
    if (!acc?.[operatorName]) acc[operatorName] = [];
    acc[operatorName].push(item);

    return acc;
  }, {} as { [key in VirtualizationFeatureOperators]: VirtFeatureOperatorItem[] });

const getOperatorHubURL = (uid: string, namespace: string) =>
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
  return InstallState.NOT_INSTALLED;
};

const getInstallStatus = (
  operators: VirtFeatureOperatorItem[],
  toBeInstalled: boolean,
): InstallState => {
  const installed = operators?.some((item) => isInstalled(item?.installState));
  const installing =
    operators?.some((item) => isInstalling(item?.installState)) ||
    (toBeInstalled && operators?.some((item) => isNotInstalled(item?.installState)));
  const failed = operators?.some((item) => installFailed(item?.installState));

  if (installed) return InstallState.INSTALLED;
  if (installing) return InstallState.INSTALLING;
  if (failed) return InstallState.FAILED;

  return InstallState.NOT_INSTALLED;
};

export const getOperatorData = (
  operatorItemsMap: VirtFeatureOperatorItemsMap,
  operatorsToInstall: OperatorsToInstall,
  namespace: string,
): OperatorDetailsMap => {
  const operatorsData = isEmpty(operatorItemsMap)
    ? defaultVirtFeatureOperatorItemsMap
    : Object.entries(operatorItemsMap).reduce((acc, [operatorName, operatorItems]) => {
        acc[operatorName] = {
          installState:
            getInstallStatus(operatorItems, operatorsToInstall[operatorName]) ||
            InstallState.UNKNOWN,
          operatorHubURL: getOperatorHubURL(operatorItems?.[0]?.uid, namespace) || undefined,
        };

        return acc;
      }, {} as OperatorDetailsMap);

  const operatorsDataKeys = Object.keys(operatorsData);
  operatorPackageNames.forEach((name) => {
    if (!operatorsDataKeys.includes(name)) operatorsData[name] = defaultOperatorData;
  });

  return operatorsData;
};
