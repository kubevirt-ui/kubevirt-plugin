import { type V1LabelSelector } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1MigrationConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type CalculationMethod } from '@kubevirt-utils/resources/quotas/types';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const HCO_FEATURE_GATE_STATE = {
  Disabled: 'Disabled',
  Enabled: 'Enabled',
} as const;

export type HCOFeatureGateState =
  (typeof HCO_FEATURE_GATE_STATE)[keyof typeof HCO_FEATURE_GATE_STATE];

export type HCOFeatureGateEntry = {
  name: string;
  state?: HCOFeatureGateState;
};

export type HCOFeatureGatesV1Beta1 = {
  autoResourceLimits?: boolean;
  declarativeHotplugVolumes?: boolean;
  deployKubeSecondaryDNS?: boolean;
  deployTektonTaskResources?: boolean;
  disableMDevConfiguration?: boolean;
  enableCommonBootImageImport?: boolean;
  enableMultiArchBootImageImport?: boolean;
  nonRoot?: boolean;
  persistentReservation?: boolean;
  root?: boolean;
  withHostPassthroughCPU?: boolean;
};

export type HCOKsmConfiguration = { nodeLabelSelector?: Record<string, never> };

type HCOVirtualizationSpec = {
  autoCPULimitNamespaceLabelSelector?: V1LabelSelector;
  evictionStrategy?: string;
  higherWorkloadDensity?: { memoryOvercommitPercentage: number };
  ksmConfiguration?: HCOKsmConfiguration;
  liveMigrationConfig?: V1MigrationConfiguration;
  roleAggregationStrategy?: string;
  virtualMachineOptions?: { disableSerialConsoleLog?: string };
};

type HCOWorkloadSourcesSpec = {
  commonBootImageNamespace?: string;
  commonTemplatesNamespace?: string;
  dataImportCronTemplates?: K8sResourceCommon[];
  enableCommonBootImageImport?: boolean;
};

type HCOApplicationAwareConfigV1Beta1 = {
  allowApplicationAwareClusterResourceQuota?: boolean;
  vmiCalcConfigName?: CalculationMethod;
};

type HCOApplicationAwareConfigV1 = HCOApplicationAwareConfigV1Beta1 & {
  enable?: boolean;
};

type HCODeploymentSpec = {
  applicationAwareConfig?: HCOApplicationAwareConfigV1;
};

export type HyperConvergedSpecV1Beta1 = {
  applicationAwareConfig?: HCOApplicationAwareConfigV1Beta1;
  commonBootImageNamespace?: string;
  commonTemplatesNamespace?: string;
  dataImportCronTemplates?: K8sResourceCommon[];
  enableApplicationAwareQuota?: boolean;
  enableCommonBootImageImport?: boolean;
  evictionStrategy?: string;
  featureGates?: HCOFeatureGatesV1Beta1;
  higherWorkloadDensity?: { memoryOvercommitPercentage: number };
  ksmConfiguration?: HCOKsmConfiguration;
  liveMigrationConfig?: V1MigrationConfiguration;
  resourceRequirements?: {
    autoCPULimitNamespaceLabelSelector?: V1LabelSelector;
  };
  roleAggregationStrategy?: string;
  virtualMachineOptions?: { disableSerialConsoleLog?: string };
};

export type HyperConvergedSpecV1 = {
  deployment?: HCODeploymentSpec;
  featureGates?: HCOFeatureGateEntry[];
  virtualization?: HCOVirtualizationSpec;
  workloadSources?: HCOWorkloadSourcesSpec;
};

export type HyperConvergedSpec = HyperConvergedSpecV1 | HyperConvergedSpecV1Beta1;

type HyperConvergedStatus = {
  dataImportCronTemplates?: K8sResourceCommon[];
  nodeInfo?: {
    workloadsArchitectures?: string[];
  };
};

export type HyperConvergedV1Beta1 = K8sResourceCommon & {
  spec?: HyperConvergedSpecV1Beta1;
  status?: HyperConvergedStatus;
};

export type HyperConvergedV1 = K8sResourceCommon & {
  spec?: HyperConvergedSpecV1;
  status?: HyperConvergedStatus;
};

export type HyperConverged = HyperConvergedV1 | HyperConvergedV1Beta1;
