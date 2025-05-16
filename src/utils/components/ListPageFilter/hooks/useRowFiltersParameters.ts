import { useCallback, useMemo } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';

import { useQueryParamsMethods } from './useQueryParamsMethods';

type UseRowFiltersParametersType = (inputs: {
  filterKeys: { [key: string]: string };
  filters: { [key: string]: string[] };
}) => [string[], (selected: string[]) => void];

export const useRowFiltersParameters: UseRowFiltersParametersType = ({ filterKeys, filters }) => {
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();
  const queryParams = useQuery();

  const selectedRowFilters = useMemo(
    () =>
      Object.values(filterKeys || {})
        .map((values) => queryParams.get(values)?.split(',') ?? [])
        .flat(),
    [queryParams, filterKeys],
  );

  const syncRowFilterParams = useCallback(
    (selected: string[]) => {
      Object.entries(filters || {}).forEach(([key, value]) => {
        const recognized = selected.filter((item) => value.includes(item));
        setOrRemoveQueryArgument(filterKeys[key], recognized.join(','));
      });
    },
    [filters, setOrRemoveQueryArgument, filterKeys],
  );

  return [selectedRowFilters, syncRowFilterParams];
};
