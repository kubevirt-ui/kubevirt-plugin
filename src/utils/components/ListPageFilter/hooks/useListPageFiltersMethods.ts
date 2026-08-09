import { useCallback, useEffect, useRef } from 'react';
import { useDebounceCallback } from 'src/views/clusteroverview/utils/hooks/useDebounceCallback';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type OnFilterChange, type RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { STATIC_SEARCH_FILTERS } from '../constants';
import { type ApplyTextFilters, type ListPageFiltersMethodsOutputs } from '../types';
import { type generateRowFilters, intersection } from '../utils';

import { useApplyFiltersWithQuery } from './useApplyFiltersWithQuery';

type ListPageFiltersMethodsInputs = {
  applyFilters: OnFilterChange;
  generatedRowFilters: ReturnType<typeof generateRowFilters>;
  onRowFilterSearchParamChange: (selected: string[]) => void;
  searchFilters: RowFilter[];
  selectedRowFilters: string[];
  setSearchInputText: (text: string) => void;
};

type UseListPageFiltersMethods = (
  inputs: ListPageFiltersMethodsInputs,
) => ListPageFiltersMethodsOutputs;

const useListPageFiltersMethods: UseListPageFiltersMethods = ({
  applyFilters,
  generatedRowFilters,
  onRowFilterSearchParamChange,
  searchFilters,
  selectedRowFilters,
  setSearchInputText,
}) => {
  const applyTextFilters = useApplyFiltersWithQuery(applyFilters);

  const applyTextFiltersWithDebounce: ApplyTextFilters = useDebounceCallback(applyTextFilters, 250);

  const applyRowFilter = useCallback(
    (selected: string[]) => {
      for (const { items, type } of generatedRowFilters ?? []) {
        const all = items?.map?.(({ id }) => id) ?? [];
        const recognized = intersection(selected, all);
        applyFilters(type, { all, selected: [...new Set(recognized as string[])] });
      }
    },
    [generatedRowFilters, applyFilters],
  );

  const initialSyncDoneRef = useRef(false);
  useEffect(() => {
    if (initialSyncDoneRef.current || isEmpty(generatedRowFilters) || isEmpty(selectedRowFilters))
      return;

    initialSyncDoneRef.current = true;
    applyRowFilter(selectedRowFilters);
  }, [applyRowFilter, generatedRowFilters, selectedRowFilters]);

  const updateRowFilterSelected = (id: string[]): void => {
    const selectedNew = Array.from(
      new Set([
        ...id.filter((item) => !selectedRowFilters.includes(item)),
        ...selectedRowFilters.filter((item) => !id.includes(item)),
      ]),
    );
    onRowFilterSearchParamChange(selectedNew);
    applyRowFilter(selectedNew);
  };

  const clearAll = (): void => {
    updateRowFilterSelected(selectedRowFilters);
    applyTextFilters(STATIC_SEARCH_FILTERS.name);
    applyTextFilters(STATIC_SEARCH_FILTERS.labels);

    for (const filter of searchFilters) filter && applyTextFilters(filter.type);
    setSearchInputText('');
  };

  return {
    applyTextFilters,
    applyTextFiltersWithDebounce,
    clearAll,
    updateRowFilterSelected,
  };
};

export default useListPageFiltersMethods;
