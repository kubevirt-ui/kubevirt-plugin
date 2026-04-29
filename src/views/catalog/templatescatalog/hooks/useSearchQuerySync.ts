import { useEffect } from 'react';

/**
 * Resets the local search query state whenever `filtersQuery` becomes falsy
 * (e.g. when clearAll is called externally). This cancels any pending debounce
 * timers so they cannot fire stale navigations after the filters are cleared.
 */
const useSearchQuerySync = (
  filtersQuery: string | undefined,
  setQuery: (query: string) => void,
): void => {
  useEffect(() => {
    if (!filtersQuery) {
      setQuery('');
    }
  }, [filtersQuery, setQuery]);
};

export default useSearchQuerySync;
