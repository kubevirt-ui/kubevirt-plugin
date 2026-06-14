import { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { EXCLUSION_PREFIX, NUMERIC_FILTER_KEYS } from '@search/searchLanguage/constants';

import { SEARCH_KEYS } from '../../constants';
import { AutocompleteMode, DropdownType } from '../../types';

import { getSearchBadge, getValuesPart, hasOptions } from './utils';

export const useAutocompleteMode = (
  inputValue: string,
  filterDefinitions: KubevirtFilter[],
): AutocompleteMode => {
  return useMemo(() => {
    if (!inputValue || inputValue === EXCLUSION_PREFIX)
      return { filterText: '', type: DropdownType.KEYS };

    const sanitizedInput = inputValue.startsWith(EXCLUSION_PREFIX)
      ? inputValue.slice(1)
      : inputValue;

    const colonIndex = sanitizedInput.indexOf(':');

    const rawKey = (
      colonIndex > 0 ? sanitizedInput.slice(0, colonIndex) : sanitizedInput
    ).toLowerCase();

    const searchBadge = getSearchBadge(rawKey);

    if (!searchBadge) {
      if (SEARCH_KEYS.some((key) => key.startsWith(rawKey))) {
        return { filterText: inputValue, type: DropdownType.KEYS };
      }
      return { type: DropdownType.HIDDEN };
    }

    const { filterType, searchKey } = searchBadge;

    if (NUMERIC_FILTER_KEYS.has(filterType) || !hasOptions(filterType, filterDefinitions))
      return { type: DropdownType.HIDDEN };

    const { activeSegment, selectedValues } = getValuesPart(sanitizedInput, colonIndex);

    return {
      activeSegment,
      filterType,
      searchKey,
      selectedValues,
      type: DropdownType.VALUES,
    };
  }, [inputValue, filterDefinitions]);
};
