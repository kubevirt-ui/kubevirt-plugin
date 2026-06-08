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
import { getExclusionPrefix, splitAtLastToken } from '@search/searchLanguage/utils';

type UseSearchLanguageDropdownProps = {
  autocompleteMode: AutocompleteMode;
  displayText: string;
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
  setDraftText: (value: string) => void;
  trackKey: (key: string) => void;
};

type UseSearchLanguageDropdownResult = {
  onSelectKey: (badge: SearchKeyBadge) => void;
  onSelectOperator: (operator: string) => void;
  onSelectValue: (value: string) => void;
};

export const useSearchLanguageDropdown = ({
  autocompleteMode,
  displayText,
  filters,
  onSetFilters,
  setDraftText,
  trackKey,
}: UseSearchLanguageDropdownProps): UseSearchLanguageDropdownResult => {
  const { exclusionPrefix, prefix } = useMemo(() => {
    const { lastToken, prefix: p } = splitAtLastToken(displayText);
    return { exclusionPrefix: getExclusionPrefix(lastToken), prefix: p };
  }, [displayText]);

  const onSelectKey = useCallback(
    (badge: SearchKeyBadge) => {
      const keyText = badge.usesColon === false ? badge.searchKey : `${badge.searchKey}:`;
      setDraftText(`${prefix}${exclusionPrefix}${keyText}`);
    },
    [prefix, exclusionPrefix, setDraftText],
  );

  const onSelectValue = useCallback(
    (value: string) => {
      if (autocompleteMode.type !== DropdownType.VALUES) return;

      const { filterType, searchKey, selectedValues = [] } = autocompleteMode;

      const lowerValue = value.toLowerCase();
      const isAlreadySelected = selectedValues.some((v) => v.toLowerCase() === lowerValue);

      const toggled = isAlreadySelected
        ? selectedValues.filter((v) => v.toLowerCase() !== lowerValue)
        : [...selectedValues, value];

      const isExcluded = !!exclusionPrefix;
      const newFilterValues = toggled.map((v) => formatFilterValue(v, isExcluded));

      const currentValues = filters[filterType] ?? [];
      const oppositePolarity = currentValues.filter((v) => isExcludedValue(v) !== isExcluded);

      onSetFilters({ [filterType]: [...oppositePolarity, ...newFilterValues] });
      trackKey(filterType);

      const valuesText = isEmpty(toggled) ? '' : `${toggled.join(',')},`;
      setDraftText(`${prefix}${exclusionPrefix}${searchKey}:${valuesText}`);
    },
    [autocompleteMode, filters, prefix, exclusionPrefix, onSetFilters, setDraftText, trackKey],
  );

  const onSelectOperator = useCallback(
    (operator: string) => {
      if (autocompleteMode.type !== DropdownType.OPERATORS) return;

      const { searchKey } = autocompleteMode;
      setDraftText(`${prefix}${exclusionPrefix}${searchKey}${operator}`);
    },
    [autocompleteMode, prefix, exclusionPrefix, setDraftText],
  );

  return {
    onSelectKey,
    onSelectOperator,
    onSelectValue,
  };
};
