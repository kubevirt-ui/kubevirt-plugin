import { convertToBaseValue, humanizeBinaryBytesWithoutB } from '@kubevirt-utils/utils/humanize.js';
import { binaryUnitsOrdered } from '@kubevirt-utils/utils/unitConstants';
import { type BinaryUnit } from '@kubevirt-utils/utils/unitConstants';

export const getMinSizes = (pvcSize: string): Record<BinaryUnit, number> => {
  const pvcSizeBytes = convertToBaseValue(pvcSize) as number;

  const minSizes: Record<BinaryUnit, number> = {} as Record<BinaryUnit, number>;

  for (const unit of binaryUnitsOrdered) {
    minSizes[unit] = (
      humanizeBinaryBytesWithoutB(pvcSizeBytes, null, unit) as { value: number }
    ).value;
  }

  return minSizes;
};
