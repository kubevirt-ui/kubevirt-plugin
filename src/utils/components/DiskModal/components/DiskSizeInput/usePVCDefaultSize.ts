import { useState } from 'react';

import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';

const usePVCDefaultSize = (pvcSize: string) => {
  const pvcSizeBytes = convertToBaseValue(pvcSize);

  const minSizes = Object.fromEntries(
    Object.values(CAPACITY_UNITS).map((unit) => [
      unit,
      humanizeBinaryBytes(pvcSizeBytes, null, unit),
    ]),
  );

  const [selectedUnit, setSelectedUnit] = useState<CAPACITY_UNITS>(
    humanizeBinaryBytes(pvcSizeBytes).unit,
  );

  return { minSizes, selectedUnit, setSelectedUnit };
};

export default usePVCDefaultSize;
