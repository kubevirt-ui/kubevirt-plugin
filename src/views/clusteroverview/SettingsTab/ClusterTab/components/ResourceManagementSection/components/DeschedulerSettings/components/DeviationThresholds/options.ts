import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SimpleSelectOption } from '@patternfly/react-templates';

import { DeviationThresholdsValues } from '../../utils/constants';

export const options: SimpleSelectOption[] = [
  { content: t('Low (10%:30%)'), value: DeviationThresholdsValues.Low },
  { content: t('Medium (20%:50%)'), value: DeviationThresholdsValues.Medium },
  { content: t('High (40%:70%)'), value: DeviationThresholdsValues.High },
  { content: t('AsymmetricLow (0%:10%)'), value: DeviationThresholdsValues.AsymmetricLow },
  { content: t('AsymmetricMedium (0%:20%)'), value: DeviationThresholdsValues.AsymmetricMedium },
  { content: t('AsymmetricHigh (0%:30%)'), value: DeviationThresholdsValues.AsymmetricHigh },
];
