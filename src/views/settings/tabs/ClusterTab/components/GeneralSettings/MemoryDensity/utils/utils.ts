import { TFunction } from 'i18next';

import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

import {
  MEMORY_OVERCOMMIT_STARTING_VALUE,
  MEMORY_REQUEST_RATIO_MAX,
  MEMORY_REQUEST_RATIO_MIN,
} from './const';

export type RatioLevel = 'caution' | 'recommended' | 'risk';

export type RatioLevelConfig = {
  color: string;
  description: string;
  label: string;
  title: string;
};

export const getRatioLevelConfig = (t: TFunction): Record<RatioLevel, RatioLevelConfig> => ({
  recommended: {
    color: 'var(--pf-t--global--color--status--success--default)',
    description: t("Requests most of each VM's configured memory on the cluster."),
    label: t('Recommended'),
    title: t('Recommended (75% and above)'),
  },
  caution: {
    color: 'var(--pf-t--global--color--status--warning--default)',
    description: t('Moderate overcommit. Monitor cluster memory pressure.'),
    label: t('Use with caution'),
    title: t('Use with caution (50% to 74.9%)'),
  },
  risk: {
    color: 'var(--pf-t--global--color--status--danger--default)',
    description: t('Each VM requests less than half of its configured memory.'),
    label: t('High overcommit risk'),
    title: t('High overcommit risk (25% to 49.9%)'),
  },
});

/**
 * Converts a UI display value (25–100%) to the HCO API integer.
 * The HCO field stores "% of memory VMI sees vs pod request", which is
 * the inverse of the UI's "% of configured memory requested on the cluster".
 */
export const displayToApiValue = (display: number): number => Math.round(10000 / display);

/** Converts a HCO API integer to a UI display value (25–100%). */
export const apiValueToDisplay = (apiValue: number): number => Math.round(10000 / apiValue);

export const isValidRatio = (value: number): boolean =>
  value >= MEMORY_REQUEST_RATIO_MIN && value <= MEMORY_REQUEST_RATIO_MAX;

export const getRatioLevel = (value: number): RatioLevel => {
  if (value >= 75) return 'recommended';
  if (value >= 50) return 'caution';
  return 'risk';
};

export const updateMemoryOvercommit = async (
  hyperConverge: HyperConverged,
  displayValue: number,
  cluster?: string,
): Promise<void> => {
  if (!isValidRatio(displayValue)) {
    throw new Error(
      `Invalid ratio value: ${displayValue}. Must be between ${MEMORY_REQUEST_RATIO_MIN} and ${MEMORY_REQUEST_RATIO_MAX}.`,
    );
  }

  await kubevirtK8sPatch({
    cluster,
    data: [
      {
        op: 'add',
        path: `/spec/higherWorkloadDensity/memoryOvercommitPercentage`,
        value: displayToApiValue(displayValue),
      },
    ],
    model: HyperConvergedModel,
    resource: hyperConverge,
  });
};

export const getCurrentOvercommit = (hyperConverge: HyperConverged): number => {
  const apiValue =
    hyperConverge?.spec?.higherWorkloadDensity?.memoryOvercommitPercentage ??
    MEMORY_OVERCOMMIT_STARTING_VALUE;
  return apiValueToDisplay(apiValue);
};
