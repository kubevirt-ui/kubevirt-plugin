import { type CalculationMethod } from '../quotas/types';
import { isHyperConvergedV1 } from './model';
import { type HyperConverged, type HyperConvergedSpecV1Beta1 } from './types';

export const getAAQCalculationMethod = (
  hyperConverge: HyperConverged | undefined,
): CalculationMethod | undefined =>
  isHyperConvergedV1(hyperConverge)
    ? hyperConverge?.spec?.deployment?.applicationAwareConfig?.vmiCalcConfigName
    : (hyperConverge?.spec as HyperConvergedSpecV1Beta1)?.applicationAwareConfig?.vmiCalcConfigName;

export const isAAQEnabled = (hyperConverge: HyperConverged | undefined): boolean =>
  isHyperConvergedV1(hyperConverge)
    ? Boolean(hyperConverge?.spec?.deployment?.applicationAwareConfig?.enable)
    : Boolean((hyperConverge?.spec as HyperConvergedSpecV1Beta1)?.enableApplicationAwareQuota);
