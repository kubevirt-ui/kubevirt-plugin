import { useCallback, useMemo } from 'react';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';

import { KubevirtFilterState, OnSetFilters } from '../types';

type UseSyncedLabelsFilter = (
  filters: KubevirtFilterState,
  onSetFilters: OnSetFilters,
  searchParams: URLSearchParams,
) => {
  syncedFilters: KubevirtFilterState;
  syncedOnSetFilters: OnSetFilters;
};

/**
 * useDataViewFilters only syncs from URL on mount — labels set externally
 * (e.g. tree view folder navigation via navigate()) are not reflected in PF's
 * internal state. This hook fixes both the read and write paths:
 *
 * Read:  derives labels from searchParams so display/filtering stay reactive.
 * Write: wraps onSetFilters to inject current URL labels into every update
 *        that doesn't explicitly set labels, preventing PF from overwriting
 *        the URL with its stale internal labels: [].
 * @param filters - the filters to sync
 * @param onSetFilters - the function to set the filters
 * @param searchParams - the URL search params to get the labels from
 */
const useSyncedLabelsFilter: UseSyncedLabelsFilter = (filters, onSetFilters, searchParams) => {
  const labelsFromURL = useMemo(
    () => searchParams.getAll(STATIC_SEARCH_FILTERS.labels),
    [searchParams],
  );

  const syncedFilters = useMemo<KubevirtFilterState>(
    () => ({
      ...filters,
      [STATIC_SEARCH_FILTERS.labels]: labelsFromURL,
    }),
    [filters, labelsFromURL],
  );

  const syncedOnSetFilters: OnSetFilters = useCallback(
    (newFilters) => {
      if (STATIC_SEARCH_FILTERS.labels in newFilters) {
        onSetFilters(newFilters);
        return;
      }
      onSetFilters({ [STATIC_SEARCH_FILTERS.labels]: labelsFromURL, ...newFilters });
    },
    [onSetFilters, labelsFromURL],
  );

  return { syncedFilters, syncedOnSetFilters };
};

export default useSyncedLabelsFilter;
