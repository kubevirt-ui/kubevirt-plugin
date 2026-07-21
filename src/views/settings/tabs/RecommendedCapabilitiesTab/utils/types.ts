import { OLSPromptType } from '@lightspeed/utils/prompts';
import {
  type OperatorGroupKind,
  type PackageManifestKind,
  type SubscriptionKind,
} from '@overview/utils/types';
import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';

export enum CapabilitiesView {
  Bundle = 'bundle',
  Custom = 'custom',
}

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

export type SelectionCardConfig = {
  description: string;
  id: CapabilitiesView;
  label: string;
  showRecommendedBadge: boolean;
};

export type AlternativeStateMap = Record<string, boolean>;

export type UseInstallBundleParams = {
  detailsMap: RecommendedCapabilityDetailsMap;
  features: CapabilityFeature[];
  filteredPackageManifests: PackageManifestKind[];
  operatorGroups: OperatorGroupKind[];
  subscriptions: SubscriptionKind[];
};

export type UseInstallBundleReturn = {
  installBundle: () => Promise<void>;
  installResourcesLoaded: boolean;
  isInstalling: boolean;
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
