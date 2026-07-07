import { ClusterServiceVersionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  OperatorGroupModel,
  PackageManifestModel,
  SubscriptionModel,
} from '@kubevirt-utils/models';
import { getGroupVersionKindForModel } from '@openshift-console/dynamic-plugin-sdk';

export const getWatchedOperatorResources = (cluster?: string) => ({
  allPackageManifests: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(PackageManifestModel),
    isList: true,
  },
  clusterServiceVersions: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(ClusterServiceVersionModel),
    isList: true,
  },
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
