import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';

import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getUrlSearchQuery } from '@search/utils/query';

import { SavedSearchData, SavedSearchEntry } from '../savedSearches/types';

type SavedSearchDataResult = {
  deleteSearch: (name: string) => void;
  saveSearch: (name: string, data: SavedSearchData) => void;
  searches: SavedSearchEntry[];
  searchesInitiallyLoaded: boolean;
  searchesLoadError: Error;
  toggleFavorite: (name: string) => void;
  urlSearchQuery: string;
};

export const useSavedSearchData = (): SavedSearchDataResult => {
  const location = useLocation();

  const urlSearchQuery = useMemo(() => getUrlSearchQuery(location.search), [location.search]);

  const [savedSearches, setSavedSearches, searchesLoaded, searchesLoadError] =
    useKubevirtUserSettings(USER_SETTINGS_KEYS.savedSearches);

  const searchEntries = useMemo(
    () =>
      Object.entries<SavedSearchData>(savedSearches ?? {}).map<SavedSearchEntry>(
        ([name, { description, isFavorited, query }]) => ({
          description,
          isFavorited: isFavorited ?? false,
          name,
          query,
        }),
      ),
    [savedSearches],
  );

  const deleteSearch = useCallback<SavedSearchDataResult['deleteSearch']>(
    (name) => {
      const { [name]: _, ...restSearches } = savedSearches;

      setSavedSearches?.(restSearches);
    },
    [setSavedSearches, savedSearches],
  );

  const saveSearch = useCallback<SavedSearchDataResult['saveSearch']>(
    (name, data) => {
      setSavedSearches?.({
        ...savedSearches,
        [name]: data,
      });
    },
    [setSavedSearches, savedSearches],
  );

  const toggleFavorite = useCallback<SavedSearchDataResult['toggleFavorite']>(
    (name) => {
      const entry = savedSearches?.[name];
      if (!entry) return;

      setSavedSearches?.({
        ...savedSearches,
        [name]: { ...entry, isFavorited: !entry.isFavorited },
      });
    },
    [setSavedSearches, savedSearches],
  );

  return {
    deleteSearch,
    saveSearch,
    searches: searchEntries,
    searchesInitiallyLoaded: searchesLoaded || !isEmpty(searchEntries),
    searchesLoadError,
    toggleFavorite,
    urlSearchQuery,
  };
};
