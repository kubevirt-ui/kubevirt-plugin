import { useCallback, useMemo } from 'react';

import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';

const MAX_RECENT_SEARCHES = 3;

type UseRecentSearchesResult = {
  addRecentSearch: (token: string) => void;
  recentSearches: string[];
};

const useRecentSearches = (): UseRecentSearchesResult => {
  const [storedSearches, setStoredSearches] = useKubevirtUserSettings(
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

      const current = Array.isArray(storedSearches) ? storedSearches : [];
      const deduplicated = current.filter((s) => s !== trimmed);
      const updated = [trimmed, ...deduplicated].slice(0, MAX_RECENT_SEARCHES);

      setStoredSearches?.(updated);
    },
    [storedSearches, setStoredSearches],
  );

  return { addRecentSearch, recentSearches };
};

export default useRecentSearches;
