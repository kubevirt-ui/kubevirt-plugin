import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useVMSearchURL from '@multicluster/hooks/useVMSearchURL';
import { validSearchQueryParams } from '@search/utils/constants';

type SavedSearchData = {
  description: string;
  query: string;
};

type SavedSearchEntry = SavedSearchData & {
  name: string;
};

type SavedSearchDataResult = {
  applySearch: (name: string) => void;
  deleteSearch: (name: string) => void;
  saveSearch: (name: string, data: SavedSearchData) => void;
  searches: SavedSearchEntry[];
  searchesLoaded: boolean;
  searchesLoadError: Error;
  urlSearchQuery: string;
};

type UseSavedSearchData = () => SavedSearchDataResult;

export const useSavedSearchData: UseSavedSearchData = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchPageURL = useVMSearchURL();

  const urlSearchQuery = useMemo(() => {
    const allParams = new URLSearchParams(location.search);
    const searchParams = new URLSearchParams();

    for (const key of allParams.keys()) {
      if (validSearchQueryParams.includes(key)) {
        searchParams.set(key, allParams.get(key));
      }
    }

    return searchParams.toString();
  }, [location.search]);

  const [savedSearches, setSavedSearches, searchesLoaded, searchesLoadError] =
    useKubevirtUserSettings('savedSearches');

  const searchEntries = useMemo(
    () =>
      Object.entries<SavedSearchData>(savedSearches ?? {}).reduce<SavedSearchEntry[]>(
        (acc, [name, data]) => [...acc, { description: data.description, name, query: data.query }],
        [],
      ),
    [savedSearches],
  );

  const applySearch = useCallback<SavedSearchDataResult['applySearch']>(
    (name) => {
      const query = savedSearches?.[name]?.query;

      if (query) {
        navigate(`${searchPageURL}?${query}${location.hash}`, { replace: true });
      }
    },
    [savedSearches, navigate, searchPageURL, location.hash],
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

  return useMemo<SavedSearchDataResult>(
    () => ({
      applySearch,
      deleteSearch,
      saveSearch,
      searches: searchEntries,
      searchesLoaded,
      searchesLoadError,
      urlSearchQuery,
    }),
    [
      applySearch,
      saveSearch,
      searchEntries,
      searchesLoaded,
      searchesLoadError,
      urlSearchQuery,
      deleteSearch,
    ],
  );
};
