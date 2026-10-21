import { type CalculationMethod } from '../quotas/types';
import { usesHyperConvergedV1Spec } from './model';
import { type HyperConverged, type HyperConvergedSpec, type HyperConvergedSpecV1 } from './types';

type LegacyAaqSpec = Exclude<HyperConvergedSpec, HyperConvergedSpecV1>;

type V1AaqConfig = NonNullable<HyperConvergedSpecV1['deployment']>['applicationAwareConfig'];

const getV1AaqConfig = (hyperConverge: HyperConverged | undefined): V1AaqConfig | undefined => {
  const spec = hyperConverge?.spec;
  if (!spec || !('deployment' in spec)) {
    return undefined;
  }
  return (spec as HyperConvergedSpecV1).deployment?.applicationAwareConfig;
};

const getLegacyAaqSpec = (hyperConverge: HyperConverged | undefined): LegacyAaqSpec | undefined => {
  const spec = hyperConverge?.spec;
  if (!spec || 'deployment' in spec) {
    return undefined;
  }
  return spec as LegacyAaqSpec;
};

export const getAAQCalculationMethod = (
  hyperConverge: HyperConverged | undefined,
): CalculationMethod | undefined => {
  if (usesHyperConvergedV1Spec(hyperConverge)) {
    return getV1AaqConfig(hyperConverge)?.vmiCalcConfigName;
  }
  return getLegacyAaqSpec(hyperConverge)?.applicationAwareConfig?.vmiCalcConfigName;
};

export const isAAQEnabled = (hyperConverge: HyperConverged | undefined): boolean => {
  if (usesHyperConvergedV1Spec(hyperConverge)) {
    return getV1AaqConfig(hyperConverge)?.enable === true;
  }
  return Boolean(getLegacyAaqSpec(hyperConverge)?.enableApplicationAwareQuota);
};

export const isAAQEnableStateConfirmed = (
  hyperConverge: HyperConverged | undefined,
  expectedEnabled: boolean,
): boolean => {
  if (usesHyperConvergedV1Spec(hyperConverge)) {
    const enable = getV1AaqConfig(hyperConverge)?.enable;
    return expectedEnabled ? enable === true : enable === false;
  }
  const flag = getLegacyAaqSpec(hyperConverge)?.enableApplicationAwareQuota;
  return expectedEnabled ? flag === true : flag === false;
};
