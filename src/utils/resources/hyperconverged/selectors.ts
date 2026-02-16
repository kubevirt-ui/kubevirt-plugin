import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

import { CalculationMethod } from '../quotas/types';

export const getAAQCalculationMethod = (hyperConverge: HyperConverged): CalculationMethod =>
  hyperConverge?.spec?.applicationAwareConfig?.vmiCalcConfigName;
