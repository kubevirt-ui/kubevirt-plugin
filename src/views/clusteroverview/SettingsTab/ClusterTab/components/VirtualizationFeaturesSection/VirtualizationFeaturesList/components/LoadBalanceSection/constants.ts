import { DeviationThreshold } from '@kubevirt-utils/resources/descheduler/types';

export const deviationThresholdOptions = [
  {
    description: '0%:10%',
    value: DeviationThreshold.AsymmetricLow,
  },
  {
    description: '0%:20%',
    value: DeviationThreshold.AsymmetricMedium,
  },
  {
    description: '0%:30%',
    value: DeviationThreshold.AsymmetricHigh,
  },
  {
    description: '10%:10%',
    value: DeviationThreshold.Low,
  },
  {
    description: '20%:20%',
    value: DeviationThreshold.Medium,
  },
  {
    description: '30%:30%',
    value: DeviationThreshold.High,
  },
];
