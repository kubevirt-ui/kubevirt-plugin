import { useState } from 'react';

import { BinaryUnit, type QuantityUnit } from '@kubevirt-utils/utils/unitConstants';
import { toQuantity } from '@kubevirt-utils/utils/units';

import { getUnitOptions } from './utils';

const useUnitOptions = (size: string): QuantityUnit[] => {
  const [initialSize] = useState(() => size);
  const { unit: initialUnit } = toQuantity(initialSize) ?? {};

  return getUnitOptions(initialUnit ?? BinaryUnit.Gi);
};

export default useUnitOptions;
