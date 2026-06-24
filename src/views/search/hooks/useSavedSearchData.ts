import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';

import { logVMSavedSearchApplied } from '@kubevirt-utils/extensions/telemetry/dashboard';
import {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { updateFilterState } from '@search/searchLanguage/hooks/useOnCommitText/updateFilterState';
import { validSearchQueryParams } from '@search/utils/constants';
import { convertQueryToFilterState } from '@search/utils/query';

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

type UseSavedSearchDataProps = {
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
};

type UseSavedSearchData = (props: UseSavedSearchDataProps) => SavedSearchDataResult;

export const useSavedSearchData: UseSavedSearchData = ({ filters, onSetFilters }) => {
  const location = useLocation();

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
    useKubevirtUserSettings(USER_SETTINGS_KEYS.savedSearches);

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
        const newFilters = convertQueryToFilterState(query);
        updateFilterState(filters, newFilters, onSetFilters);
        logVMSavedSearchApplied(query);
      }
    },
    [savedSearches, filters, onSetFilters],
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

  return {
    applySearch,
    deleteSearch,
    saveSearch,
    searches: searchEntries,
    searchesLoaded,
    searchesLoadError,
    urlSearchQuery,
  };
};
