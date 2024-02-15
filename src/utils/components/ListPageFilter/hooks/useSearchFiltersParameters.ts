import { useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

export type TextFiltersType = {
  labels: string[];
  name: string;
} & { [key: string]: string };

export const useSearchFiltersParameters = (searchFilters: RowFilter[]): TextFiltersType => {
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location]);

  const nameTextFilter = useMemo(() => queryParams.get('name'), [queryParams]);
  const labelTextFilters = useMemo(
    () => queryParams.get('labels')?.split(',') ?? [],
    [queryParams],
  );

  const searchTextFilters = useMemo(() => {
    const filters = searchFilters?.reduce((acc, filter) => {
      const { type } = filter;
      const filterValue = queryParams.get(type);

      if (filterValue) acc[type] = filterValue;
      return acc;
    }, {} as { [key in string]: string });

    return filters;
  }, [queryParams, searchFilters]);

  return useMemo(
    () =>
      ({ labels: labelTextFilters, name: nameTextFilter, ...searchTextFilters } as TextFiltersType),
    [labelTextFilters, nameTextFilter, searchTextFilters],
  );
};
