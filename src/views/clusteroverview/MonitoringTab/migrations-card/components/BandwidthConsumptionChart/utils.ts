import { multipliers } from '@kubevirt-utils/utils/units';

export const roundToNearest512MiB = (size: number): number => {
  const mib512 = multipliers.Mi * 512;
  return Math.round(size / mib512) * mib512 ?? mib512;
};
