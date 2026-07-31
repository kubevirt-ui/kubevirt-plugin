import { ClusterServiceVersionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  OperatorGroupModel,
  PackageManifestModel,
  SubscriptionModel,
} from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getGroupVersionKindForModel } from '@openshift-console/dynamic-plugin-sdk';
import {
  type OperatorGroupKind,
  type PackageManifestKind,
  type SubscriptionKind,
} from '@overview/utils/types';
import { type FleetWatchK8sResource } from '@stolostron/multicluster-sdk';

import { OPENSHIFT_MARKETPLACE_NAMESPACE } from '../../../utils/constants';
import { RED_HAT_CATALOG_SOURCE } from '../../../utils/createOperator/constants';
import { getSubscriptionInstalledCSV, subscriptionFor } from '../../../utils/operatorResolution';
import { PACKAGE_MANIFESTS_WATCH_KEY } from './constants';
import { type OperatorWatchResourceResult } from './types';

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
    selector: { matchLabels: { catalog: RED_HAT_CATALOG_SOURCE } },
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
