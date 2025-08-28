import { useRef } from 'react';

import { toQuantity } from '@kubevirt-utils/utils/units';

import { getUnitOptions } from './utils';

const useUnitOptions = (size: string) => {
  const initialSizeRef = useRef(size);
  const { unit: initialUnit } = toQuantity(initialSizeRef.current);

  return getUnitOptions(initialUnit);
};

export default useUnitOptions;
