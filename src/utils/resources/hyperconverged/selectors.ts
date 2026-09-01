import { type V1KubeVirtConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import type { KubevirtHyperconverged } from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';

import { type CalculationMethod } from '../quotas/types';

export const getAAQCalculationMethod = (hyperConverge: HyperConverged): CalculationMethod =>
  hyperConverge?.spec?.applicationAwareConfig?.vmiCalcConfigName;

export const getHyperconvergedConfiguration = (
  hyperConverged: KubevirtHyperconverged | undefined,
): undefined | V1KubeVirtConfiguration => hyperConverged?.spec?.configuration;

export const getHyperconvergedRoleAggregationStrategy = (
  hyperConverged: KubevirtHyperconverged | undefined,
): string | undefined => getHyperconvergedConfiguration(hyperConverged)?.roleAggregationStrategy;

export const getHCORoleAggregationStrategy = (
  hyperConverge: HyperConverged | undefined,
): string | undefined => hyperConverge?.spec?.roleAggregationStrategy;
