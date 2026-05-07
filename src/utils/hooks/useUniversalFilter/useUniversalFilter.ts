import { useCallback } from 'react';
import { useDebounceCallback } from 'src/views/clusteroverview/utils/hooks/useDebounceCallback';

import { useApplyFiltersWithQuery } from '@kubevirt-utils/components/ListPageFilter/hooks/useApplyFiltersWithQuery';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { getRowFilterQueryKey } from '@search/utils/query';

import useQuery from '../useQuery';

type UniversalFilterProps = {
  onFilterChange: OnFilterChange;
};

export type UniversalFilter = {
  hasQueryKey: (queryKey: string) => boolean;
  isSelected: (queryKey: string, value: string) => boolean;
  onSelect: (queryKey: string, value: string) => void;
  queryParams: URLSearchParams;
  setValue: (queryKey: string, value: string) => void;
  setValueWithDebounce: (queryKey: string, value: string) => void;
};

type UseUniversalFilter = (props: UniversalFilterProps) => UniversalFilter;

const useUniversalFilter: UseUniversalFilter = ({ onFilterChange }) => {
  const queryParams = useQuery();
  const applyFiltersWithQuery = useApplyFiltersWithQuery(onFilterChange);

  const getSelectedValues = useCallback(
    (queryKey: string) => queryParams.get(getRowFilterQueryKey(queryKey))?.split(',') ?? [],
    [queryParams],
  );

  const isSelected = useCallback(
    (queryKey: string, value: string) => getSelectedValues(queryKey).includes(value),
    [getSelectedValues],
  );

  const hasQueryKey = useCallback(
    (queryKey: string) => queryParams.has(getRowFilterQueryKey(queryKey)),
    [queryParams],
  );

  const onSelect = useCallback(
    (queryKey: string, value: string) => {
      const selectedValues = getSelectedValues(queryKey);
      applyFiltersWithQuery(
        queryKey,
        selectedValues.includes(value)
          ? selectedValues.filter((v) => v !== value)
          : [...selectedValues, value],
      );
    },
    [getSelectedValues, applyFiltersWithQuery],
  );

  const setValue = useCallback(
    (queryKey: string, value: string) => applyFiltersWithQuery(queryKey, value),
    [applyFiltersWithQuery],
  );

  const setValueWithDebounce = useDebounceCallback(setValue, 250);

  return {
    hasQueryKey,
    isSelected,
    onSelect,
    queryParams,
    setValue,
    setValueWithDebounce,
  };
};

export default useUniversalFilter;
