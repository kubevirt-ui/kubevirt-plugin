import {
  type V1KubeVirtConfiguration,
  type V1MigrationConfiguration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { toArray } from '@kubevirt-utils/components/LazyActionMenu/order-extensions';
import type { KubevirtHyperconverged } from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { type CalculationMethod } from '../quotas/types';
import { isHyperConvergedV1 } from './model';
import {
  HCO_FEATURE_GATE_STATE,
  type HCOFeatureGateEntry,
  type HCOFeatureGatesV1Beta1,
  type HCOKsmConfiguration,
  type HyperConverged,
  type HyperConvergedSpecV1,
  type HyperConvergedSpecV1Beta1,
} from './types';

const getVirtualizationSpec = (
  hyperConverge: HyperConverged | undefined,
): HyperConvergedSpecV1['virtualization'] | HyperConvergedSpecV1Beta1 | undefined =>
  isHyperConvergedV1(hyperConverge) ? hyperConverge?.spec?.virtualization : hyperConverge?.spec;

const getWorkloadSourcesSpec = (
  hyperConverged: HyperConverged | undefined,
): HyperConvergedSpecV1['workloadSources'] | HyperConvergedSpecV1Beta1 | undefined =>
  isHyperConvergedV1(hyperConverged) ? hyperConverged?.spec?.workloadSources : hyperConverged?.spec;

export const getAAQCalculationMethod = (
  hyperConverge: HyperConverged | undefined,
): CalculationMethod | undefined => hyperConverge?.spec?.applicationAwareConfig?.vmiCalcConfigName;

export const isAAQEnabled = (hyperConverge: HyperConverged | undefined): boolean =>
  Boolean(hyperConverge?.spec?.enableApplicationAwareQuota);

export const getHyperconvergedConfiguration = (
  hyperConverged: KubevirtHyperconverged | undefined,
): undefined | V1KubeVirtConfiguration => hyperConverged?.spec?.configuration;

export const getHyperconvergedRoleAggregationStrategy = (
  hyperConverged: KubevirtHyperconverged | undefined,
): string | undefined => getHyperconvergedConfiguration(hyperConverged)?.roleAggregationStrategy;

export const getHCOFeatureGates = (
  hyperConverge: HyperConverged | undefined,
): HCOFeatureGateEntry[] | HCOFeatureGatesV1Beta1 | undefined => hyperConverge?.spec?.featureGates;

export const getHCOFeatureGateEntries = (
  hyperConverge: HyperConverged | undefined,
): HCOFeatureGateEntry[] => {
  const featureGates = getHCOFeatureGates(hyperConverge);
  return Array.isArray(featureGates) ? [...toArray(featureGates)] : [];
};

export const getHCOFeatureGatesV1Beta1 = (
  hyperConverge: HyperConverged | undefined,
): HCOFeatureGatesV1Beta1 | undefined => {
  const featureGates = getHCOFeatureGates(hyperConverge);
  return featureGates && !Array.isArray(featureGates) ? featureGates : undefined;
};

export const getHCORoleAggregationStrategy = (
  hyperConverge: HyperConverged | undefined,
): string | undefined => getVirtualizationSpec(hyperConverge)?.roleAggregationStrategy;

export const getLiveMigrationConfig = (
  hyperConverge: HyperConverged | undefined,
): V1MigrationConfiguration | undefined =>
  getVirtualizationSpec(hyperConverge)?.liveMigrationConfig;

export const getLiveMigrationNetwork = (
  hyperConverged: HyperConverged | undefined,
): string | undefined => getLiveMigrationConfig(hyperConverged)?.network;

export const getMemoryOvercommitPercentage = (
  hyperConverge: HyperConverged | undefined,
): number | undefined =>
  getVirtualizationSpec(hyperConverge)?.higherWorkloadDensity?.memoryOvercommitPercentage;

export const getEvictionStrategy = (
  hyperConverge: HyperConverged | undefined,
): string | undefined => getVirtualizationSpec(hyperConverge)?.evictionStrategy;

export const getDisableSerialConsoleLog = (
  hyperConverge: HyperConverged | undefined,
): string | undefined =>
  getVirtualizationSpec(hyperConverge)?.virtualMachineOptions?.disableSerialConsoleLog;

export const getKsmConfiguration = (
  hyperConverge: HyperConverged | undefined,
): HCOKsmConfiguration | undefined => getVirtualizationSpec(hyperConverge)?.ksmConfiguration;

export const getCommonTemplatesNamespace = (
  hyperConverged: HyperConverged | undefined,
): string | undefined => getWorkloadSourcesSpec(hyperConverged)?.commonTemplatesNamespace;

export const getCommonBootImageNamespace = (
  hyperConverged: HyperConverged | undefined,
): string | undefined => getWorkloadSourcesSpec(hyperConverged)?.commonBootImageNamespace;

export const getEnableCommonBootImageImport = (
  hyperConverged: HyperConverged | undefined,
): boolean | undefined => getWorkloadSourcesSpec(hyperConverged)?.enableCommonBootImageImport;

export const getDataImportCronTemplates = (
  hyperConverged: HyperConverged | undefined,
): K8sResourceCommon[] | undefined => {
  if (isHyperConvergedV1(hyperConverged)) {
    return (
      hyperConverged?.spec?.workloadSources?.dataImportCronTemplates ??
      hyperConverged?.status?.dataImportCronTemplates
    );
  }
  return (
    hyperConverged?.spec?.dataImportCronTemplates ?? hyperConverged?.status?.dataImportCronTemplates
  );
};

export const getSpecDataImportCronTemplates = (
  hyperConverged: HyperConverged | undefined,
): K8sResourceCommon[] | undefined => {
  if (isHyperConvergedV1(hyperConverged)) {
    return hyperConverged?.spec?.workloadSources?.dataImportCronTemplates;
  }
  return hyperConverged?.spec?.dataImportCronTemplates;
};

export const featureGateNamesMatch = (left: string, right: string): boolean =>
  left.toLowerCase() === right.toLowerCase();

export const isFeatureGateEnabled = (
  hyperConverge: HyperConverged | undefined,
  gateName: string,
): boolean => {
  if (!hyperConverge) {
    return false;
  }

  if (isHyperConvergedV1(hyperConverge)) {
    const gate = getHCOFeatureGateEntries(hyperConverge).find((entry) =>
      featureGateNamesMatch(entry.name, gateName),
    );
    if (!gate) {
      return false;
    }
    return gate.state !== HCO_FEATURE_GATE_STATE.Disabled;
  }

  const featureGates = getHCOFeatureGatesV1Beta1(hyperConverge);
  if (!featureGates) {
    return false;
  }
  return Boolean(featureGates[gateName as keyof typeof featureGates]);
};
