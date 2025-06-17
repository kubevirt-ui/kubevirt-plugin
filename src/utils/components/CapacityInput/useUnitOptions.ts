import { useState } from 'react';

import { toQuantity } from '@kubevirt-utils/utils/units';

import { getUnitOptions } from './utils';

const useUnitOptions = (size: string) => {
  const [initialSize] = useState(size);
  const { unit: initialUnit } = toQuantity(initialSize);

  return getUnitOptions(initialUnit);
};

export default useUnitOptions;
