import { AlertType } from '@kubevirt-utils/components/AlertsCard/utils/types';

export const SEVERITY_TO_CONDITION_VALUE: Record<'none' | AlertType, number> = {
  [AlertType.critical]: 2,
  [AlertType.info]: 0,
  [AlertType.warning]: 1,
  none: 0,
};

export const VALUE_TO_LABEL: Record<number, string> = {
  0: 'Healthy', // t('Healthy')
  1: 'Warning', // t('Warning')
  2: 'Degraded', // t('Degraded')
};
