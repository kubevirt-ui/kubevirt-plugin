import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { useDebounceCallback } from 'src/views/clusteroverview/utils/hooks/useDebounceCallback';

import {
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export type UniversalFilter = {
  hasQueryKey: (filterId: string) => boolean;
  isSelected: (filterId: string, value: string) => boolean;
  onSelect: (filterId: string, value: string) => void;
  setValue: (filterId: string, value?: null | string | string[]) => void;
  setValueWithDebounce: (filterId: string, value?: null | string | string[]) => void;
};

type UseUniversalFilterProps = {
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
};

const useUniversalFilter = ({
  filters,
  onSetFilters,
}: UseUniversalFilterProps): UniversalFilter => {
  const [searchParams] = useSearchParams();

  const hasQueryKey = useCallback(
    (filterId: string) => searchParams.has(filterId) || !isEmpty(filters[filterId]),
    [searchParams, filters],
  );

  const isSelected = useCallback(
    (filterId: string, value: string) => filters[filterId]?.includes(value) ?? false,
    [filters],
  );

  const onSelect = useCallback(
    (filterId: string, value: string) => {
      const current = filters[filterId] ?? [];
      const nextValues = current.includes(value)
        ? current.filter((filterValue) => filterValue !== value)
        : [...current, value];
      onSetFilters({ [filterId]: nextValues });
    },
    [filters, onSetFilters],
  );

  const setValue = useCallback(
    (filterId: string, value?: null | string | string[]) => {
      if (value === null || value === undefined) {
        onSetFilters({ [filterId]: [] });
        return;
      }
      const values = Array.isArray(value) ? value : [value];
      onSetFilters({ [filterId]: values });
    },
    [onSetFilters],
  );

  const setValueWithDebounce = useDebounceCallback(setValue, 250);

  return {
    hasQueryKey,
    isSelected,
    onSelect,
    setValue,
    setValueWithDebounce,
  };
};

export default useUniversalFilter;
