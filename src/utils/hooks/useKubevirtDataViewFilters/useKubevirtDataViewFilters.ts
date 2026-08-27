import { useMemo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useDataViewFilters } from '@patternfly/react-data-view';

import { useKubevirtTranslation } from '../useKubevirtTranslation';

import { EMPTY_FILTERS } from './constants';
import { getLabelFilter } from './filters/getLabelFilter';
import { getNameFilter } from './filters/getNameFilter';
import useMigratedSearchParams from './hooks/useMigratedSearchParams';
import useSyncedGroupFilter from './hooks/useSyncedGroupFilter';
import {
  type FilterableObject,
  type KubevirtFilter,
  type KubevirtFilterState,
  type OnSetFilters,
} from './types';
import { matchesWithExclusion } from './utils';

type UseKubevirtDataViewFiltersArgs<T extends FilterableObject> = {
  data: T[];
  filterDefinitions?: KubevirtFilter<T>[];
  hideLabelFilter?: boolean;
  syncWithURL?: boolean;
};

const EMPTY_SEARCH_PARAMS = new URLSearchParams();

type UseKubevirtDataViewFiltersResult<T extends FilterableObject> = {
  clearAllFilters: () => void;
  filteredData: T[];
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
};

const useKubevirtDataViewFilters = <T extends FilterableObject>({
  data,
  filterDefinitions: filterDefinitionsProp = EMPTY_FILTERS,
  hideLabelFilter,
  syncWithURL = true,
}: UseKubevirtDataViewFiltersArgs<T>): UseKubevirtDataViewFiltersResult<T> => {
  const { t } = useKubevirtTranslation();
  const [searchParams, setSearchParams] = useMigratedSearchParams();
  const effectiveSearchParams = syncWithURL ? searchParams : undefined;

  const filterDefinitions = useMemo(
    () => [
      getNameFilter(t),
      ...(hideLabelFilter ? [] : [getLabelFilter(t)]),
      ...filterDefinitionsProp,
    ],
    [filterDefinitionsProp, hideLabelFilter, t],
  );

  const initialFilters = useMemo<KubevirtFilterState>(
    () =>
      filterDefinitions.reduce<KubevirtFilterState>((acc, filter) => {
        acc[filter.id] = filter.defaultSelected ?? [];
        return acc;
      }, {} as KubevirtFilterState),
    [filterDefinitions],
  );

  const { clearAllFilters, filters, onSetFilters } = useDataViewFilters<KubevirtFilterState>({
    initialFilters,
    searchParams: effectiveSearchParams,
    setSearchParams: syncWithURL ? setSearchParams : undefined,
  });

  const { syncedFilters, syncedOnSetFilters } = useSyncedGroupFilter(
    filters,
    onSetFilters,
    effectiveSearchParams ?? EMPTY_SEARCH_PARAMS,
  );

  const filteredData = useMemo(
    () =>
      data?.filter((obj) =>
        filterDefinitions.every((filterDef) => {
          const selected = syncedFilters[filterDef.id];

          if (filterDef.applyWhenEmpty) {
            return matchesWithExclusion(filterDef, obj, selected ?? []);
          }
          return isEmpty(selected) || matchesWithExclusion(filterDef, obj, selected);
        }),
      ) ?? [],
    [data, syncedFilters, filterDefinitions],
  );

  return {
    clearAllFilters,
    filteredData,
    filters: syncedFilters,
    onSetFilters: syncedOnSetFilters,
  };
};

export default useKubevirtDataViewFilters;
