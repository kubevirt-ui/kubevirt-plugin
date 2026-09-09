import { useState } from 'react';

import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';

const areValuesEqual = <T>(left: T, right: T, stringify?: boolean): boolean =>
  stringify ? JSON.stringify(left) === JSON.stringify(right) : isEqualObject(left, right);

const useDeepCompareMemoize = <T>(value: T, stringify?: boolean): T => {
  const [memoizedValue, setMemoizedValue] = useState(value);

  if (!areValuesEqual(value, memoizedValue, stringify)) {
    setMemoizedValue(value);
  }

  return memoizedValue;
};

export default useDeepCompareMemoize;
