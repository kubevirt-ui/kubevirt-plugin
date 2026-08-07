import { useRef } from 'react';

import { BinaryUnit } from '@kubevirt-utils/utils/unitConstants';
import { toQuantity } from '@kubevirt-utils/utils/units';

import { getUnitOptions } from './utils';

const useUnitOptions = (size: string) => {
  const initialSizeRef = useRef(size);
  const { unit: initialUnit } = toQuantity(initialSizeRef.current) ?? {};

  return getUnitOptions(initialUnit ?? BinaryUnit.Gi);
};

export default useUnitOptions;
