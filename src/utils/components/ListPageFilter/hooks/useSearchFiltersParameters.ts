import { useMemo } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { TextFiltersType } from '../types';

export const useSearchFiltersParameters = (searchFilters: RowFilter[]): TextFiltersType => {
  const queryParams = useQuery();

  const nameTextFilter = useMemo(() => queryParams.get('name'), [queryParams]);
  const labelTextFilters = useMemo(
    () => queryParams.get('labels')?.split(',') ?? [],
    [queryParams],
  );

  const searchTextFilters = useMemo(() => {
    const filters = searchFilters?.reduce<Record<string, string>>((acc, filter) => {
      const { type } = filter;
      const filterValue = queryParams.get(type);

      if (filterValue) acc[type] = filterValue;
      return acc;
    }, {});

    return filters;
  }, [queryParams, searchFilters]);

  return useMemo(
    () =>
      ({ labels: labelTextFilters, name: nameTextFilter, ...searchTextFilters } as TextFiltersType),
    [labelTextFilters, nameTextFilter, searchTextFilters],
  );
};
