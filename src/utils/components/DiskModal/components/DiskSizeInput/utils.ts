import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';

export const getMinSizes = (pvcSize: string) => {
  const pvcSizeBytes = convertToBaseValue(pvcSize);

  const minSizes: Record<CAPACITY_UNITS, number> = {} as Record<CAPACITY_UNITS, number>;

  Object.values(CAPACITY_UNITS).forEach((unit) => {
    minSizes[unit] = humanizeBinaryBytes(pvcSizeBytes, null, unit).value;
  });

  return minSizes;
};
