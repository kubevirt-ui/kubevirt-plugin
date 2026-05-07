import { useMemo } from 'react';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { FilterValue, RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { getRowFilterQueryKey } from '@search/utils/query';

import useQuery from './useQuery';

const useFiltersFromURL = (rowFilters: RowFilter[]): Record<string, FilterValue> => {
  const queryParams = useQuery();

  return useMemo(() => {
    const staticFilters: Record<string, FilterValue> = {};

    const addFilter = (filterKey: string) => {
      const paramValue = queryParams.get(getRowFilterQueryKey(filterKey));

      if (paramValue) {
        const filterValueType = filterKey === STATIC_SEARCH_FILTERS.labels ? 'all' : 'selected';
        staticFilters[filterKey] = { [filterValueType]: paramValue.split(',') };
      }
    };

    for (const filter of rowFilters) {
      addFilter(filter.type);
    }

    addFilter(STATIC_SEARCH_FILTERS.name);
    addFilter(STATIC_SEARCH_FILTERS.labels);

    return staticFilters;
  }, [queryParams, rowFilters]);
};

export default useFiltersFromURL;
