import { useMemo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useDataViewFilters } from '@patternfly/react-data-view';

import { useKubevirtTranslation } from '../useKubevirtTranslation';

import { EMPTY_FILTERS } from './constants';
import { getLabelFilter } from './filters/getLabelFilter';
import { getNameFilter } from './filters/getNameFilter';
import useMigratedSearchParams from './hooks/useMigratedSearchParams';
import useSyncedGroupFilter from './hooks/useSyncedGroupFilter';
import { FilterableObject, KubevirtFilter, KubevirtFilterState, OnSetFilters } from './types';
import { matchesWithExclusion } from './utils';

type UseKubevirtDataViewFiltersArgs<T extends FilterableObject> = {
  data: T[];
  filterDefinitions?: KubevirtFilter<T>[];
  hideLabelFilter?: boolean;
};

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
}: UseKubevirtDataViewFiltersArgs<T>): UseKubevirtDataViewFiltersResult<T> => {
  const { t } = useKubevirtTranslation();
  const [searchParams, setSearchParams] = useMigratedSearchParams();

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
    searchParams,
    setSearchParams,
  });

  const { syncedFilters, syncedOnSetFilters } = useSyncedGroupFilter(
    filters,
    onSetFilters,
    searchParams,
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
