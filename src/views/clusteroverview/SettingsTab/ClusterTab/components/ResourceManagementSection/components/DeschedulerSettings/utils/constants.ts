import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { DeschedulerType } from './types';

export enum Customizations {
  ActualUtilizationProfile = 'ActualUtilizationProfile',
  DeviationThresholds = 'DeviationThresholds',
  EnableSoftTainter = 'EnableSoftTainter',
  LowNodeUtilizationThresholds = 'LowNodeUtilizationThresholds',
}

export const customizationDescriptions = {
  ActualUtilizationProfile: t('Enable load-aware descheduling'),
  DeviationThresholds: t('Have the thresholds be based on the average utilization'),
  EnableSoftTainter: t(
    'Have the operator deploying the soft-tainter component to dynamically set/remove soft taints according to the same criteria used for load aware descheduling',
  ),
  LowNodeUtilizationThresholds: t(
    'Sets experimental thresholds for the LowNodeUtilization strategy',
  ),
};

export enum ActualUtilizationProfileValues {
  PrometheusCPUCombined = 'PrometheusCPUCombined',
  PrometheusCPUPSIPressure = 'PrometheusCPUPSIPressure',
  PrometheusCPUPSIPressureByUtilization = 'PrometheusCPUPSIPressureByUtilization',
  PrometheusCPUUsage = 'PrometheusCPUUsage',
  PrometheusIOPSIPressure = 'PrometheusIOPSIPressure',
  PrometheusMemoryPSIPressure = 'PrometheusMemoryPSIPressure',
}

export enum DeviationThresholdsValues {
  AsymmetricHigh = 'AsymmetricHigh',
  AsymmetricLow = 'AsymmetricLow',
  AsymmetricMedium = 'AsymmetricMedium',
  High = 'High',
  Low = 'Low',
  Medium = 'Medium',
}

export enum LowNodeUtilizationThresholdsValues {
  High = 'High',
  Low = 'Low',
  Medium = 'Medium',
}

export enum DeschedulerMode {
  Automatic = 'Automatic',
  Predictive = 'Predictive',
}

export const defaultDescheduler: DeschedulerType = {
  apiVersion: 'operator.openshift.io/v1',
  kind: 'KubeDescheduler',
  metadata: {
    name: 'cluster',
    namespace: 'openshift-kube-descheduler-operator',
  },
  spec: {
    deschedulingIntervalSeconds: 30,
    managementState: 'Managed',
    mode: DeschedulerMode.Automatic,
    profileCustomizations: {
      devActualUtilizationProfile: ActualUtilizationProfileValues.PrometheusCPUCombined,
      devDeviationThresholds: DeviationThresholdsValues.AsymmetricLow,
      devEnableSoftTainter: true,
    },
    profiles: ['DevKubeVirtRelieveAndMigrate'],
  },
};
