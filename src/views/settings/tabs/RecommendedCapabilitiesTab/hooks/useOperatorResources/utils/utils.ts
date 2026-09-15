import { ClusterServiceVersionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  OperatorGroupModel,
  PackageManifestModel,
  SubscriptionModel,
} from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  type OperatorGroupKind,
  type PackageManifestKind,
  type SubscriptionKind,
} from '@kubevirt-utils/types/olm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getGroupVersionKindForModel } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetWatchK8sResource } from '@stolostron/multicluster-sdk';

import { OPENSHIFT_MARKETPLACE_NAMESPACE, RED_HAT } from '../../../utils/constants';
import {
  isRedHatCatalogSource,
  RED_HAT_CATALOG_SOURCE,
} from '../../../utils/createOperator/constants';
import { getSubscriptionInstalledCSV, subscriptionFor } from '../../../utils/operatorResolution';
import { PACKAGE_MANIFESTS_WATCH_KEY } from './constants';
import { type OperatorWatchResourceResult } from './types';

const catalogSourceOf = (pkg: PackageManifestKind): string => pkg.status?.catalogSource ?? '';

const pickPreferred = (candidates: PackageManifestKind[]): PackageManifestKind | undefined =>
  candidates.find((pkg) => catalogSourceOf(pkg) === RED_HAT_CATALOG_SOURCE) ??
  candidates.find((pkg) => isRedHatCatalogSource(catalogSourceOf(pkg))) ??
  candidates.find((pkg) => pkg.status?.provider?.name?.includes(RED_HAT)) ??
  candidates[0];

/** One PackageManifest per package name, preferring redhat-operators then redhat-operators*. */
export const selectPreferredPackageManifests = (
  manifests: PackageManifestKind[],
): PackageManifestKind[] => {
  const named = manifests.filter((pkg) => getName(pkg));
  const names = [...new Set(named.map(getName).filter((name): name is string => Boolean(name)))];

  return names
    .map((name) => pickPreferred(named.filter((pkg) => getName(pkg) === name)))
    .filter((pkg): pkg is PackageManifestKind => Boolean(pkg));
};

export const getCsvResourceKey = (packageName: string): string =>
  `clusterServiceVersion_${packageName}`;

export const mapWatchResourceData = <T>(
  keys: string[],
  watchData: Record<string, OperatorWatchResourceResult<T>> | undefined,
): T[] => keys.map((key) => watchData?.[key]?.data).filter((data): data is T => !isEmpty(data));

export const mapWatchResourceErrors = (
  keys: string[],
  watchData: Record<string, OperatorWatchResourceResult<unknown>> | undefined,
): unknown[] => keys.map((key) => watchData?.[key]?.loadError).filter(Boolean);

export const getCsvWatchResources = (
  cluster: string | undefined,
  packageManifests: PackageManifestKind[],
  subscriptions: SubscriptionKind[],
  operatorGroups: OperatorGroupKind[],
): Record<string, FleetWatchK8sResource> => {
  const entries: [string, FleetWatchK8sResource][] = [];

  for (const pkg of packageManifests) {
    if (!pkg) {
      continue;
    }

    const subscription = subscriptionFor(subscriptions, operatorGroups, pkg);
    const csvName = subscription && getSubscriptionInstalledCSV(subscription);
    const namespace = subscription?.metadata?.namespace;

    if (!csvName || !namespace) {
      continue;
    }

    entries.push([
      getCsvResourceKey(getName(pkg)),
      {
        cluster,
        groupVersionKind: getGroupVersionKindForModel(ClusterServiceVersionModel),
        isList: false,
        name: csvName,
        namespace,
      },
    ]);
  }

  return Object.fromEntries(entries);
};

export const getPackageManifestWatchResources = (
  cluster: string | undefined,
): Record<string, FleetWatchK8sResource> => ({
  [PACKAGE_MANIFESTS_WATCH_KEY]: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(PackageManifestModel),
    isList: true,
    namespace: OPENSHIFT_MARKETPLACE_NAMESPACE,
  },
});

export const getBaseOperatorWatchResources = (
  cluster?: string,
): {
  operatorGroups: FleetWatchK8sResource;
  subscriptions: FleetWatchK8sResource;
} => ({
  operatorGroups: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(OperatorGroupModel),
    isList: true,
  },
  subscriptions: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(SubscriptionModel),
    isList: true,
  },
});
