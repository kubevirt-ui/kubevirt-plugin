import { useRef } from 'react';

import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';

const useDeepCompareMemoize = <T = any>(value: T, strinfigy?: boolean): T => {
  const ref = useRef<T>();

  if (
    strinfigy
      ? JSON.stringify(value) !== JSON.stringify(ref.current)
      : !isEqualObject(value, ref.current)
  ) {
    ref.current = value;
  }

  return ref.current;
};

export default useDeepCompareMemoize;
