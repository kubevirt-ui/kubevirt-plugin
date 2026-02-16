import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

export const isAAQEnabled = (hyperConverge: HyperConverged): boolean => {
  return Boolean(hyperConverge?.spec?.enableApplicationAwareQuota);
};
