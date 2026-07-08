import { useCallback, useMemo } from 'react';

import {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import {
  formatFilterValue,
  isExcludedValue,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  AutocompleteMode,
  DropdownType,
  SearchKeyBadge,
} from '@search/components/SearchDropdown/types';
import { type SetDraftTextWithCursor } from '@search/hooks/useCursorTracking';
import { TokenParts } from '@search/searchLanguage/types';
import { getExclusionPrefix } from '@search/searchLanguage/utils';
import { isFromValue, isToValue } from '@search/utils/dateCreatedValues';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

type UseSearchLanguageDropdownProps = {
  autocompleteMode: AutocompleteMode;
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
  setDraftTextWithCursor: SetDraftTextWithCursor;
  tokenParts: TokenParts;
  trackKey: (key: string) => void;
};

type UseSearchLanguageDropdownResult = {
  onSelectKey: (badge: SearchKeyBadge) => void;
  onSelectOperator: (operator: string) => void;
  onSelectValue: (value: string) => void;
};

export const useSearchLanguageDropdown = ({
  autocompleteMode,
  filters,
  onSetFilters,
  setDraftTextWithCursor,
  tokenParts,
  trackKey,
}: UseSearchLanguageDropdownProps): UseSearchLanguageDropdownResult => {
  const { prefix, suffix, token } = tokenParts;
  const exclusionPrefix = useMemo(() => getExclusionPrefix(token), [token]);

  const updateDraftText = useCallback(
    (newToken: string) => {
      const newText = `${prefix}${exclusionPrefix}${newToken}${suffix}`;
      setDraftTextWithCursor(newText, prefix.length + exclusionPrefix.length + newToken.length);
    },
    [prefix, exclusionPrefix, suffix, setDraftTextWithCursor],
  );

  const onSelectKey = useCallback(
    (badge: SearchKeyBadge) => {
      const keyText = badge.usesColon === false ? badge.searchKey : `${badge.searchKey}:`;
      updateDraftText(keyText);
    },
    [updateDraftText],
  );

  const onSelectValue = useCallback(
    (value: string) => {
      if (autocompleteMode.type !== DropdownType.VALUES) return;

      const { filterType, searchKey, selectedValues = [] } = autocompleteMode;

      if (filterType === VirtualMachineRowFilterType.DateCreated) {
        if (isFromValue(value) || isToValue(value)) {
          const currentPrefix = isEmpty(selectedValues) ? '' : `${selectedValues[0]},`;
          updateDraftText(`${searchKey}:${currentPrefix}${value}`);
          return;
        }

        const isExcluded = !!exclusionPrefix;
        const finalValue = formatFilterValue(value, isExcluded);

        onSetFilters({
          [VirtualMachineRowFilterType.DateCreated]: [finalValue],
          [VirtualMachineRowFilterType.DateCreatedFrom]: [],
          [VirtualMachineRowFilterType.DateCreatedTo]: [],
        });
        trackKey(filterType);
        updateDraftText(`${searchKey}:${value}`);
        return;
      }

      const lowerValue = value.toLowerCase();
      const isAlreadySelected = selectedValues.some((v) => v.toLowerCase() === lowerValue);

      const newSelectedValues = isAlreadySelected
        ? selectedValues.filter((v) => v.toLowerCase() !== lowerValue)
        : [...selectedValues, value];

      const isExcluded = !!exclusionPrefix;
      const newFilterValues = newSelectedValues.map((v) => formatFilterValue(v, isExcluded));

      const currentValues = filters[filterType] ?? [];
      const oppositePolarity = currentValues.filter((v) => isExcludedValue(v) !== isExcluded);

      onSetFilters({ [filterType]: [...oppositePolarity, ...newFilterValues] });
      trackKey(filterType);

      const valuesText = isEmpty(newSelectedValues) ? '' : `${newSelectedValues.join(',')},`;
      updateDraftText(`${searchKey}:${valuesText}`);
    },
    [autocompleteMode, filters, updateDraftText, exclusionPrefix, onSetFilters, trackKey],
  );

  const onSelectOperator = useCallback(
    (operator: string) => {
      if (autocompleteMode.type !== DropdownType.OPERATORS) return;

      const { searchKey } = autocompleteMode;
      updateDraftText(`${searchKey}${operator}`);
    },
    [autocompleteMode, updateDraftText],
  );

  return {
    onSelectKey,
    onSelectOperator,
    onSelectValue,
  };
};
