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

  const createDebounced = useCallback(
    () =>
      debounce(
        (...args: Parameters<T>) => {
          callbackRef.current(...args);
        },
        timeout,
        immediate,
      ),
    [timeout, immediate],
  );

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    debouncedRef.current = createDebounced();

    return (): void => {
      debouncedRef.current = null;
    };
  }, [createDebounced]);

  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- debounced wrapper must accept varied caller args (legacy API)
    (...args: any[]): any => {
      debouncedRef.current ??= createDebounced();
      return debouncedRef.current(...(args as Parameters<T>));
    },
    [createDebounced],
  );
};
