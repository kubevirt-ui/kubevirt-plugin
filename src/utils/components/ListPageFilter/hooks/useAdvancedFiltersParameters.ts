import { useMemo } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

export const useAdvancedFiltersParameters = (advancedFilters: RowFilter[] = []) => {
  const queryParams = useQuery();

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
