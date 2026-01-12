import { convertToBaseValue, humanizeBinaryBytesWithoutB } from '@kubevirt-utils/utils/humanize.js';
import { binaryUnitsOrdered } from '@kubevirt-utils/utils/unitConstants';
import { BinaryUnit } from '@kubevirt-utils/utils/unitConstants';

export const getMinSizes = (pvcSize: string) => {
  const pvcSizeBytes = convertToBaseValue(pvcSize);

  const minSizes: Record<BinaryUnit, number> = {} as Record<BinaryUnit, number>;

  binaryUnitsOrdered.forEach((unit) => {
    minSizes[unit] = humanizeBinaryBytesWithoutB(pvcSizeBytes, null, unit).value;
  });

  return minSizes;
};
