import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { LowNodeUtilizationThresholdsValues } from '../../utils/constants';

export const options = [
  { label: t('Low (10%:30%)'), value: LowNodeUtilizationThresholdsValues.Low },
  { label: t('Medium (20%:50%)'), value: LowNodeUtilizationThresholdsValues.Medium },
  { label: t('High (40%:70%)'), value: LowNodeUtilizationThresholdsValues.High },
];
