import { V1KubeVirtConfiguration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import type { KubevirtHyperconverged } from '@kubevirt-utils/hooks/useKubevirtHyperconvergeConfiguration';

import { CalculationMethod } from '../quotas/types';

export const getAAQCalculationMethod = (hyperConverge: HyperConverged): CalculationMethod =>
  hyperConverge?.spec?.applicationAwareConfig?.vmiCalcConfigName;

export const getHyperconvergedConfiguration = (
  hc: KubevirtHyperconverged | undefined,
): undefined | V1KubeVirtConfiguration => hc?.spec?.configuration;

export const getHyperconvergedRoleAggregationStrategy = (
  hc: KubevirtHyperconverged | undefined,
): string | undefined => getHyperconvergedConfiguration(hc)?.roleAggregationStrategy;
