import { DeviationThreshold, KubeDescheduler } from '@kubevirt-utils/resources/descheduler/types';

export const getDeviationThreshold = (descheduler: KubeDescheduler): DeviationThreshold =>
  descheduler?.spec?.profileCustomizations?.devDeviationThresholds;
