import {
  ClusterServiceVersionKind,
  OperatorGroupKind,
  PackageManifestKind,
  SubscriptionKind,
} from '@overview/utils/types';

export type OperatorResources = {
  clusterServiceVersions: ClusterServiceVersionKind[];
  marketplacePackageManifests: PackageManifestKind[];
  operatorGroups: OperatorGroupKind[];
  packageManifests: PackageManifestKind[];
  subscriptions: SubscriptionKind[];
};
