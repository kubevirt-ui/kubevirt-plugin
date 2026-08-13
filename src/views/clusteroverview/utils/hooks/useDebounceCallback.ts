import { useEffect, useMemo, useRef } from 'react';

import { debounce } from '@kubevirt-utils/utils/debounce';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic constraint requires any for proper function type inference
export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  timeout = 500,
  immediate = false,
): ((...args: Parameters<T>) => void) => {
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(() => {
    // eslint-disable-next-line react-hooks/refs -- ref is read lazily at invocation time, not during render
    return debounce((...args) => callbackRef.current(...args), timeout, immediate);
  }, [immediate, timeout]);
};
