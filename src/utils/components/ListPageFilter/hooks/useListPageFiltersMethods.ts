import { useDebounceCallback } from 'src/views/clusteroverview/utils/hooks/useDebounceCallback';

import { FilterValue } from '@openshift-console/dynamic-plugin-sdk';

import { STATIC_SEARCH_FILTERS } from '../constants';
import { generateRowFilters, intersection } from '../utils';

import { useQueryParamsMethods } from './useQueryParamsMethods';

type ListPageFiltersMethodsInputs = {
  applyFilters: (type: string, input: FilterValue) => void;
  generatedRowFilters: ReturnType<typeof generateRowFilters>;
  onRowFilterSearchParamChange: (selected: string[]) => void;
  selectedRowFilters: string[];
  setSearchInputText: (text: string) => void;
};

const useListPageFiltersMethods = ({
  applyFilters,
  generatedRowFilters,
  onRowFilterSearchParamChange,
  selectedRowFilters,
  setSearchInputText,
}: ListPageFiltersMethodsInputs) => {
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();

  const applyTextFilters = (type: string, value?: string) => {
    setOrRemoveQueryArgument(type, value);

    if (type === STATIC_SEARCH_FILTERS.labels) {
      applyFilters(type, { all: value ? [value] : [] });
      return;
    }

    applyFilters(type, { selected: value ? [value] : [] });
  };

  const applyTextFiltersWithDebounce = useDebounceCallback(applyTextFilters, 250);

  const applyRowFilter = (selected: string[]) => {
    generatedRowFilters?.forEach?.(({ items, type }) => {
      const all = items?.map?.(({ id }) => id) ?? [];
      const recognized = intersection(selected, all);
      applyFilters(type, { all, selected: [...new Set(recognized as string[])] });
    });
  };

  const updateRowFilterSelected = (id: string[]) => {
    const selectedNew = Array.from(
      new Set([
        ...id.filter((item) => !selectedRowFilters.includes(item)),
        ...selectedRowFilters.filter((item) => !id.includes(item)),
      ]),
    );
    onRowFilterSearchParamChange(selectedNew);
    applyRowFilter(selectedNew);
  };

  const clearAll = () => {
    updateRowFilterSelected(selectedRowFilters);
    applyTextFilters(STATIC_SEARCH_FILTERS.name);
    applyTextFilters(STATIC_SEARCH_FILTERS.labels);
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
