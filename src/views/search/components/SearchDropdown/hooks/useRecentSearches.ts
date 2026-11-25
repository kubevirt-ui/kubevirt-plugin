import { useCallback, useMemo } from 'react';

import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
const MAX_RECENT_SEARCHES = 3;

type UseRecentSearchesResult = {
  addRecentSearch: (token: string) => void;
  recentSearches: string[];
  recentSearchesError: Error;
};

const useRecentSearches = (): UseRecentSearchesResult => {
  const [storedSearches, setStoredSearches, , recentSearchesError] = useKubevirtUserSettings(
    USER_SETTINGS_KEYS.recentSearches,
  );

  const recentSearches = useMemo<string[]>(() => {
    if (!Array.isArray(storedSearches)) return [];
    return storedSearches.slice(0, MAX_RECENT_SEARCHES);
  }, [storedSearches]);

  const addRecentSearch = useCallback(
    (token: string) => {
      const trimmed = token.trim();
      if (!trimmed) return;

      const current: string[] = Array.isArray(storedSearches)
        ? (storedSearches as never as string[])
        : [];
      const deduplicated = current.filter((search) => search !== trimmed);
      const updated = [trimmed, ...deduplicated].slice(0, MAX_RECENT_SEARCHES);

      setStoredSearches(updated);
    },
    [storedSearches, setStoredSearches],
  );

  return { addRecentSearch, recentSearches, recentSearchesError };
};

export default useRecentSearches;
