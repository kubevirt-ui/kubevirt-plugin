import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import type { KubevirtHyperconverged } from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';

import { CalculationMethod } from '../quotas/types';

export const getAAQCalculationMethod = (hyperConverge: HyperConverged): CalculationMethod =>
  hyperConverge?.spec?.applicationAwareConfig?.vmiCalcConfigName;

export const getHyperconvergedRoleAggregationStrategy = (
  hc: KubevirtHyperconverged | undefined,
): string | undefined => hc?.spec?.configuration?.roleAggregationStrategy;
