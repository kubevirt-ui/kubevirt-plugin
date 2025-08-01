import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';

import { STATIC_SEARCH_FILTERS } from '../constants';
import { ApplyTextFilters } from '../types';

import { useQueryParamsMethods } from './useQueryParamsMethods';

export const useApplyFiltersWithQuery = (applyFilters: OnFilterChange) => {
  const { setOrRemoveQueryArgument } = useQueryParamsMethods();

  const applyFiltersWithQuery: ApplyTextFilters = (type, value?) => {
    const valueIsArray = Array.isArray(value);

    setOrRemoveQueryArgument(type, valueIsArray ? value.join(',') : value);

    const values = valueIsArray ? value : [value];
    const selectedValues = value ? values : [];

    if (type === STATIC_SEARCH_FILTERS.labels) {
      applyFilters(type, { all: selectedValues });
      return;
    }

    applyFilters(type, { selected: selectedValues });
  };

  return applyFiltersWithQuery;
};
