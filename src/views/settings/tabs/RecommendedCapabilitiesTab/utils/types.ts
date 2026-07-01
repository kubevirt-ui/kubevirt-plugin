import { OLSPromptType } from '@lightspeed/utils/prompts';
import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';

export enum CapabilityInstallState {
  Installed = 'Installed',
  NotInstalled = 'NotInstalled',
  PartiallyInstalled = 'PartiallyInstalled',
}

export type CapabilityFeatureOperator = {
  alternativesPromptType?: OLSPromptType;
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
  operatorHubURL: string | undefined;
};

export type RecommendedCapabilityDetailsMap = Record<string, RecommendedCapabilityOperatorDetails>;

export type AlternativeStateMap = Record<string, boolean>;
