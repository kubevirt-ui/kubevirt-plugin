import { useMemo } from 'react';

import { type KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { EXCLUSION_PREFIX, NUMERIC_FILTER_KEYS } from '@search/searchLanguage/constants';
import { getSanitizedInput } from '@search/searchLanguage/utils';
import { isFromValue, isToValue } from '@search/utils/dateCreatedValues';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import useSearchKeyBadges from '../useSearchKeyBadges';

import { type AutocompleteMode, DropdownType } from '../../types';
import { getSearchBadge, getValuesPart, hasOperatorSign, hasOptions } from './utils';

export const useAutocompleteMode = (
  inputValue: string,
  filterDefinitions: KubevirtFilter[],
): AutocompleteMode => {
  const searchKeyBadges = useSearchKeyBadges();

  return useMemo(() => {
    if (!inputValue || inputValue === EXCLUSION_PREFIX)
      return { filterText: '', type: DropdownType.KEYS };

    const sanitizedInput = getSanitizedInput(inputValue);

    const colonIndex = sanitizedInput.indexOf(':');

    const rawKey = (
      colonIndex > 0 ? sanitizedInput.slice(0, colonIndex) : sanitizedInput
    ).toLowerCase();

    const searchBadge = getSearchBadge(rawKey, searchKeyBadges);

    if (!searchBadge) {
      if (searchKeyBadges.some(({ searchKey }) => searchKey.startsWith(rawKey))) {
        return { filterText: inputValue, type: DropdownType.KEYS };
      }
      return { type: DropdownType.HIDDEN };
    }

    const { filterType, searchKey } = searchBadge;

    if (NUMERIC_FILTER_KEYS.has(filterType)) {
      if (hasOperatorSign(sanitizedInput, rawKey)) return { type: DropdownType.HIDDEN };
      return { searchKey, type: DropdownType.OPERATORS };
    }

    if (!hasOptions(filterType, filterDefinitions)) return { type: DropdownType.HIDDEN };

    const { activeSegment, selectedValues } = getValuesPart(sanitizedInput, colonIndex);

    if (filterType === VirtualMachineRowFilterType.DateCreated) {
      const segment = activeSegment.toLowerCase();

      if (isFromValue(segment) || isToValue(segment)) {
        return { type: DropdownType.HIDDEN };
      }

      const hasFrom = selectedValues.some((val) => isFromValue(val.toLowerCase()));
      const hasTo = selectedValues.some((val) => isToValue(val.toLowerCase()));
      const hasQuickValue = selectedValues.some(
        (val) => !isFromValue(val.toLowerCase()) && !isToValue(val.toLowerCase()),
      );

      if (hasQuickValue || (hasFrom && hasTo)) {
        return { type: DropdownType.HIDDEN };
      }
    }

    return {
      activeSegment,
      filterType,
      searchKey,
      selectedValues,
      type: DropdownType.VALUES,
    };
  }, [inputValue, filterDefinitions, searchKeyBadges]);
};
