import { useCallback } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  type KubevirtFilter,
  type KubevirtFilterState,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { type PVCMapper, type VMIMapper } from '@virtualmachines/utils/mappers';

import { deselectAllVMs } from '../selectedVMs';

import useFilterSync from './useFilterSync/useFilterSync';
import useVMListFilters from './useVMListFilters';

type VMListFilterStateResult = {
  clearAllFiltersWithReset: () => void;
  filterDefinitions: KubevirtFilter<V1VirtualMachine>[];
  filteredVMs: V1VirtualMachine[];
  filters: KubevirtFilterState;
  handleSetFilters: (newFilters: Partial<KubevirtFilterState>) => void;
};

export const useVMListFilterState = (
  vmsToShow: V1VirtualMachine[],
  vmiMapper: VMIMapper,
  pvcMapper: PVCMapper,
  resetPagination: () => void,
): VMListFilterStateResult => {
  const filterDefinitions = useVMListFilters(vmiMapper, pvcMapper);

  const {
    clearAllFilters,
    filteredData: filteredVMs,
    filters,
    onSetFilters,
  } = useKubevirtDataViewFilters({ data: vmsToShow ?? [], filterDefinitions });

  const handleSetFilters = useCallback(
    (newFilters: Partial<KubevirtFilterState>) => {
      deselectAllVMs();
      resetPagination();
      onSetFilters(newFilters);
    },
    [onSetFilters, resetPagination],
  );

  useFilterSync(handleSetFilters);

  const clearAllFiltersWithReset = useCallback(() => {
    deselectAllVMs();
    resetPagination();
    clearAllFilters();
  }, [clearAllFilters, resetPagination]);

  return {
    clearAllFiltersWithReset,
    filterDefinitions,
    filteredVMs,
    filters,
    handleSetFilters,
  };
};
