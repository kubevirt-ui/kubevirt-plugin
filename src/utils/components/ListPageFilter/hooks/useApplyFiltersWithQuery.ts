import { useCallback, useEffect, useRef } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { getRowFilterQueryKey } from '@search/utils/query';

import { STATIC_SEARCH_FILTERS } from '../constants';
import { ApplyTextFilters } from '../types';

import { useQueryParamsMethods } from './useQueryParamsMethods';

export const useApplyFiltersWithQuery = (applyFilters: OnFilterChange) => {
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();
  const queryParams = useQuery();
  const nameParamClearedRef = useRef(false);

  // Handles removing the 'name' param from the URL
  useEffect(() => {
    if (!nameParamClearedRef.current) return;

    if (!queryParams.has(STATIC_SEARCH_FILTERS.name)) {
      nameParamClearedRef.current = false;
      applyFilters(STATIC_SEARCH_FILTERS.name, { selected: [] });
    }
  }, [queryParams, applyFilters]);

  const applyFiltersWithQuery = useCallback<ApplyTextFilters>(
    (type, value) => {
      const valueIsArray = Array.isArray(value);

      setOrRemoveQueryArgument(getRowFilterQueryKey(type), valueIsArray ? value.join(',') : value);

      // For 'name' param, don't call applyFilters — let the URL update first.
      // The console's useListPageFilter internal useEffect handles filtering based on updates to 'name' param.
      // We need to handle removing the 'name' param in our own effect - this is not handled by the console's useEffect.
      if (type === STATIC_SEARCH_FILTERS.name) {
        nameParamClearedRef.current = !value;
        return;
      }

      const values = valueIsArray ? value : [value];
      const selectedValues = value ? values : [];

      if (type === STATIC_SEARCH_FILTERS.labels) {
        applyFilters(type, { all: selectedValues });
        return;
      }

      applyFilters(type, { selected: selectedValues });
    },
    [applyFilters, setOrRemoveQueryArgument],
  );

  return applyFiltersWithQuery;
};
