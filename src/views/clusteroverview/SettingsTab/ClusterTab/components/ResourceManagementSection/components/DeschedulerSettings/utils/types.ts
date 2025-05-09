import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  ActualUtilizationProfileValues,
  DeschedulerMode,
  DeviationThresholdsValues,
  LowNodeUtilizationThresholdsValues,
} from './constants';

export type DeschedulerType = K8sResourceCommon & {
  spec: {
    deschedulingIntervalSeconds: number;
    managementState: 'Managed';
    mode: DeschedulerMode;
    profileCustomizations: {
      devActualUtilizationProfile?: ActualUtilizationProfileValues;
      devDeviationThresholds?: DeviationThresholdsValues;
      devEnableSoftTainter?: boolean;
      devLowNodeUtilizationThresholds?: LowNodeUtilizationThresholdsValues;
    };
    profiles: ['DevKubeVirtRelieveAndMigrate'];
  };
};

export type DeschedulerValue = boolean | number | string;
