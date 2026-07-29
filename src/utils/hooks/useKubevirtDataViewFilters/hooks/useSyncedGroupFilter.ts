import { useCallback, useMemo } from 'react';

import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { KubevirtFilterState, OnSetFilters } from '../types';

type UseSyncedGroupFilter = (
  filters: KubevirtFilterState,
  onSetFilters: OnSetFilters,
  searchParams: URLSearchParams,
) => {
  syncedFilters: KubevirtFilterState;
  syncedOnSetFilters: OnSetFilters;
};

/**
 * useDataViewFilters only syncs from URL on mount — params set externally
 * - e.g. tree view group (folder) navigation via navigate() - are not reflected in PF's
 * internal state. This hook fixes both the read and write paths for the group filter:
 *
 * Read:  derives group from searchParams so display/filtering stay reactive.
 * Write: wraps onSetFilters to inject current URL group values into every update
 *        that doesn't explicitly set group, preventing PF from overwriting
 *        the URL with its stale internal "group" filter state: [].
 * @param filters - the filters to sync
 * @param onSetFilters - the function to set the filters
 * @param searchParams - the URL search params to get the group values from
 */
const useSyncedGroupFilter: UseSyncedGroupFilter = (filters, onSetFilters, searchParams) => {
  const groupFromURL = useMemo(
    () => searchParams.getAll(VirtualMachineRowFilterType.Group),
    [searchParams],
  );

  const syncedFilters = useMemo<KubevirtFilterState>(
    () => ({
      ...filters,
      [VirtualMachineRowFilterType.Group]: groupFromURL,
    }),
    [filters, groupFromURL],
  );

  const syncedOnSetFilters: OnSetFilters = useCallback(
    (newFilters) => {
      if (VirtualMachineRowFilterType.Group in newFilters) {
        onSetFilters(newFilters);
        return;
      }
      onSetFilters({ [VirtualMachineRowFilterType.Group]: groupFromURL, ...newFilters });
    },
    [onSetFilters, groupFromURL],
  );

  return { syncedFilters, syncedOnSetFilters };
};

export default useSyncedGroupFilter;
