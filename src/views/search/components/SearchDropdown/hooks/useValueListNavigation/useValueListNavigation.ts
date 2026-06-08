import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { AutocompleteMode, DropdownType, ValueOption } from '../../types';
import { getFilteredOrderedOptions, toValueOptions } from '../../utils';
import { OptionalListNavigationResult, useListNavigation } from '../useListNavigation';

type UseValueListNavigationProps = {
  autocompleteMode: AutocompleteMode;
  filterDefinitions: KubevirtFilter[];
  focusedItemIndex: number;
  onSelectValue: (value: string) => void;
  setFocusedItemIndex: Dispatch<SetStateAction<number>>;
};

export const useValueListNavigation = ({
  autocompleteMode,
  filterDefinitions,
  focusedItemIndex,
  onSelectValue,
  setFocusedItemIndex,
}: UseValueListNavigationProps): OptionalListNavigationResult => {
  const orderedItems = useMemo(() => {
    if (autocompleteMode.type !== DropdownType.VALUES) return [];

    const { activeSegment, filterType, selectedValues } = autocompleteMode;

    const options = toValueOptions(filterDefinitions, filterType);
    return getFilteredOrderedOptions(options, activeSegment, selectedValues, filterType);
  }, [autocompleteMode, filterDefinitions]);

  const onSelect = useCallback((item: ValueOption) => onSelectValue(item.value), [onSelectValue]);

  const { onArrowKey, onSelectHighlighted } = useListNavigation(
    orderedItems,
    focusedItemIndex,
    setFocusedItemIndex,
    onSelect,
  );

  const isValuesMode = autocompleteMode.type === DropdownType.VALUES;

  return {
    onArrowKey: isValuesMode ? onArrowKey : undefined,
    onSelectHighlighted: isValuesMode ? onSelectHighlighted : undefined,
  };
};
