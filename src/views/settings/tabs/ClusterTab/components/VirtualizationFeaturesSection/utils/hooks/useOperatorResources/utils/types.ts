import {
  ClusterServiceVersionKind,
  OperatorGroupKind,
  PackageManifestKind,
  SubscriptionKind,
} from '@overview/utils/types';

export type OperatorResources = {
  allPackageManifests: PackageManifestKind[];
  clusterServiceVersions: ClusterServiceVersionKind[];
  operatorGroups: OperatorGroupKind[];
  subscriptions: SubscriptionKind[];
};
