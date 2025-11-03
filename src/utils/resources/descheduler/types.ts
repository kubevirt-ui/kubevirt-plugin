import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export type DeschedulerValue = boolean | number | string;

export enum Customization {
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

export enum ActualUtilizationProfile {
  PrometheusCPUCombined = 'PrometheusCPUCombined',
  PrometheusCPUPSIPressure = 'PrometheusCPUPSIPressure',
  PrometheusCPUPSIPressureByUtilization = 'PrometheusCPUPSIPressureByUtilization',
  PrometheusCPUUsage = 'PrometheusCPUUsage',
  PrometheusIOPSIPressure = 'PrometheusIOPSIPressure',
  PrometheusMemoryPSIPressure = 'PrometheusMemoryPSIPressure',
}

export enum DeviationThreshold {
  AsymmetricHigh = 'AsymmetricHigh',
  AsymmetricLow = 'AsymmetricLow',
  AsymmetricMedium = 'AsymmetricMedium',
  High = 'High',
  Low = 'Low',
  Medium = 'Medium',
}

export enum LowNodeUtilizationThreshold {
  High = 'High',
  Low = 'Low',
  Medium = 'Medium',
}

export enum DeschedulerMode {
  Automatic = 'Automatic',
  Predictive = 'Predictive',
}

export enum DeschedulerProfile {
  DevKubeVirtRelieveAndMigrate = 'DevKubeVirtRelieveAndMigrate',
  KubeVirtRelieveAndMigrate = 'KubeVirtRelieveAndMigrate',
}

export type KubeDescheduler = K8sResourceCommon & {
  spec: {
    deschedulingIntervalSeconds: number;
    managementState: 'Managed';
    mode: DeschedulerMode;
    profileCustomizations: {
      devActualUtilizationProfile?: ActualUtilizationProfile;
      devDeviationThresholds?: DeviationThreshold;
      devEnableSoftTainter?: boolean;
      devLowNodeUtilizationThresholds?: LowNodeUtilizationThreshold;
    };
    profiles: DeschedulerProfile[];
  };
};
