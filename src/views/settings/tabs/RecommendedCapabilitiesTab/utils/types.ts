import { OLSPromptType } from '@lightspeed/utils/prompts';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  type OperatorGroupKind,
  type PackageManifestKind,
  type SubscriptionKind,
} from '@overview/utils/types';

export type VirtualizationFeatureOperators =
  | 'cluster-kube-descheduler-operator'
  | 'cluster-observability-operator'
  | 'fence-agents-remediation'
  | 'kubernetes-nmstate-operator'
  | 'netobserv-operator'
  | 'node-healthcheck-operator';

export enum InstallState {
  'FAILED' = 'failed',
  'INSTALLED' = 'installed',
  'INSTALLING' = 'installing',
  'NOT_INSTALLED' = 'notInstalled',
  'UNKNOWN' = 'unknown',
}

export type VirtFeatureOperatorItem = {
  [key: string]: any;
  catalogSource?: string;
  catalogSourceNamespace?: string;
  createdAt?: string;
  installState?: InstallState;
  kind?: string;
  name: string;
  obj: PackageManifestKind;
  provider?: string;
  source?: string;
  subscription?: SubscriptionKind;
  uid: string;
  validSubscription?: string[];
};

export enum CapabilityInstallState {
  Installed = 'Installed',
  NotInstalled = 'NotInstalled',
  PartiallyInstalled = 'PartiallyInstalled',
}

export type CapabilityFeatureOperator = {
  alternativesPromptType?: OLSPromptType;
  description: string;
  displayName: string;
  packageName: string;
};

export type CapabilityFeature = {
  description: string;
  id: string;
  isDefaultBundle: boolean;
  operators: CapabilityFeatureOperator[];
  title: string;
};

export type RecommendedCapabilityOperatorDetails = {
  installState: InstallState;
  isRedHatProvided: boolean;
  operatorHubURL: string | undefined;
};

export type RecommendedCapabilityDetailsMap = Record<string, RecommendedCapabilityOperatorDetails>;

export enum ConfigurationStatus {
  Manual = 'Manual',
  Recommended = 'Recommended',
}

export type AutopilotOperatorStatus = {
  configStatus?: ConfigurationStatus;
  managedCR?: K8sResourceCommon;
  recommendedYAML: string;
};

export type AutopilotStatusMap = Record<string, AutopilotOperatorStatus>;

export type AlternativeStateMap = Record<string, boolean>;

export type UseInstallFeatureParams = {
  detailsMap: RecommendedCapabilityDetailsMap;
  features: CapabilityFeature[];
  filteredPackageManifests: PackageManifestKind[];
  operatorGroups: OperatorGroupKind[];
  subscriptions: SubscriptionKind[];
};

export type UseInstallFeatureReturn = {
  installFeature: (feature: CapabilityFeature) => Promise<void>;
  installingFeatures: Set<string>;
};

export type CapabilityFilterValues = {
  name: string;
  status: string[];
};

export type CapabilitySelectionState = {
  isSelected: (item: { id: string }) => boolean;
  onSelect: (isSelecting: boolean, items?: { id: string } | { id: string }[]) => void;
  selected: { id: string }[];
};
