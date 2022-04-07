import * as React from 'react';

import { debounce } from '@kubevirt-utils/utils/debounce';

export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  timeout = 500,
  immediate = false,
): ((...args) => any) => {
  const callbackRef = React.useRef<T>();
  callbackRef.current = callback;

  return React.useMemo(() => {
    return debounce((...args) => callbackRef.current(...args), timeout, immediate);
  }, [immediate, timeout]);
};
