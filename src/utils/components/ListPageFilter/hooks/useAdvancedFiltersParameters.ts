import { useMemo } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { getRowFilterQueryKey } from '@search/utils/query';

import { FilterInfo } from '../types';

export const useAdvancedFiltersParameters = (advancedFilters: RowFilter[]) => {
  const queryParams = useQuery();

  const advancedFiltersObject = useMemo(() => {
    const filters = advancedFilters.reduce<Record<string, FilterInfo>>(
      (acc, { filterGroupName, type }) => {
        const query = queryParams.get(getRowFilterQueryKey(type));

        if (query) {
          acc[type] = {
            filterGroupName,
            query,
          };
        }

        return acc;
      },
      {},
    );

    return filters;
  }, [queryParams, advancedFilters]);

  return advancedFiltersObject;
};
