import { useCallback, useEffect, useRef } from 'react';

import { debounce } from '@kubevirt-utils/utils/debounce';

export const useDebounceCallback = <T extends (...args: never[]) => unknown>(
  callback: T,
  timeout = 500,
  immediate = false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- debounced wrapper must accept varied caller args (legacy API)
): ((...args: any[]) => any) => {
  const callbackRef = useRef(callback);
  const debouncedRef = useRef<((...args: Parameters<T>) => void) | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    debouncedRef.current = debounce(
      (...args: Parameters<T>) => {
        callbackRef.current(...args);
      },
      timeout,
      immediate,
    );

    return (): void => {
      debouncedRef.current = null;
    };
  }, [timeout, immediate]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- debounced wrapper must accept varied caller args (legacy API)
  return useCallback((...args: any[]): any => {
    return debouncedRef.current?.(...(args as Parameters<T>));
  }, []);
};
