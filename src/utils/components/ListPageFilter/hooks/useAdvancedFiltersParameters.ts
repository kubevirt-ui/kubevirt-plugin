import { useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

export const useAdvancedFiltersParameters = (advancedFilters: RowFilter[] = []) => {
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const advancedFiltersObject = useMemo(() => {
    const filters = advancedFilters.reduce<Record<string, string>>((acc, filter) => {
      const { type } = filter;
      const filterValue = queryParams.get(type);

      if (filterValue) acc[type] = filterValue;
      return acc;
    }, {});

    return filters;
  }, [queryParams, advancedFilters]);

  return advancedFiltersObject;
};
