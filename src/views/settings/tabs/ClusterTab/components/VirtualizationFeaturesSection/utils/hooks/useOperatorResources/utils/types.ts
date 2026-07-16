import {
  ClusterServiceVersionKind,
  OperatorGroupKind,
  PackageManifestKind,
  SubscriptionKind,
} from '@overview/utils/types';

export type BaseOperatorWatchResources = {
  operatorGroups: OperatorGroupKind[];
  subscriptions: SubscriptionKind[];
};

export type UseOperatorResourcesReturn = {
  clusterServiceVersions: ClusterServiceVersionKind[];
  filteredPackageManifests: PackageManifestKind[];
  loadErrors: unknown[];
  operatorGroups: OperatorGroupKind[];
  operatorResourcesLoaded: boolean;
  subscriptions: SubscriptionKind[];
};

export type UsePackageManifestsParams = {
  cluster?: string;
  packageNames: readonly string[];
};

export type UsePackageManifestsReturn = {
  loaded: boolean;
  loadErrors: unknown[];
  packageManifests: PackageManifestKind[];
};

export type UseOperatorCsvsParams = {
  cluster?: string;
  enabled?: boolean;
  operatorGroups: OperatorGroupKind[];
  packageManifests: PackageManifestKind[];
  subscriptions: SubscriptionKind[];
};

export type UseOperatorCsvsReturn = {
  clusterServiceVersions: ClusterServiceVersionKind[];
  loaded: boolean;
  loadErrors: unknown[];
};

export type OperatorWatchResourceResult<T> = {
  data?: T;
  loaded?: boolean;
  loadError?: unknown;
};
