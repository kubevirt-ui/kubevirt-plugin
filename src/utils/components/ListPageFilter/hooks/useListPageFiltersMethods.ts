import { useDebounceCallback } from 'src/views/clusteroverview/utils/hooks/useDebounceCallback';

import { OnFilterChange, RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { STATIC_SEARCH_FILTERS } from '../constants';
import { ApplyTextFilters, ListPageFiltersMethodsOutputs } from '../types';
import { generateRowFilters, intersection } from '../utils';

import { useQueryParamsMethods } from './useQueryParamsMethods';

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
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();

  const applyTextFilters: ApplyTextFilters = (type, value?) => {
    const valueIsArray = Array.isArray(value);

    setOrRemoveQueryArgument(type, valueIsArray ? value.join(',') : value);

    if (type === STATIC_SEARCH_FILTERS.labels && !valueIsArray) {
      applyFilters(type, { all: value ? [value] : [] });
      return;
    }

    const selectedValues = valueIsArray ? value : [value];

    applyFilters(type, { selected: value ? selectedValues : [] });
  };

  const applyTextFiltersWithDebounce: ApplyTextFilters = useDebounceCallback(applyTextFilters, 250);

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

    searchFilters.forEach((filter) => applyTextFilters(filter.type));
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
