import { RefObject, useCallback } from 'react';

import {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { filterToSearchToken } from '../components/VirtualMachineFilteredEmptyState/utils';

type UseEditChipArgs = {
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
  searchInputRef: RefObject<HTMLInputElement>;
  setSearchInputValue: (value: string) => void;
};

export type OnEditChip = (filterId: string, value: string) => void;

export const useEditChip = ({
  filters,
  onSetFilters,
  searchInputRef,
  setSearchInputValue,
}: UseEditChipArgs): OnEditChip =>
  useCallback(
    (filterId: string, value: string) => {
      const current = filters[filterId] ?? [];
      onSetFilters({ [filterId]: current.filter((v) => v !== value) });

      const token = filterToSearchToken(filterId, value);
      setSearchInputValue(token);

      setTimeout(() => searchInputRef.current?.focus(), 0);
    },
    [filters, onSetFilters, setSearchInputValue, searchInputRef],
  );
