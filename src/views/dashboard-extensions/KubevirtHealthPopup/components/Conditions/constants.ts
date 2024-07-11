import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const HCO_HEALTH_METRIC = 'kubevirt_hco_system_health_status';

export const VALUE_TO_LABLE = {
  0: t('Healthy'),
  1: t('Warning'),
  2: t('Error'),
};
