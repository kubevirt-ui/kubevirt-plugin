import { useState } from 'react';

import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';

const useDeepCompareMemoize = <T = unknown>(value: T, stringify?: boolean): T => {
  const [memoizedValue, setMemoizedValue] = useState<T>(value);

  const hasChanged = stringify
    ? JSON.stringify(value) !== JSON.stringify(memoizedValue)
    : !isEqualObject(value, memoizedValue);

  if (hasChanged) {
    setMemoizedValue(value);
  }

  return hasChanged ? value : memoizedValue;
};

export default useDeepCompareMemoize;
