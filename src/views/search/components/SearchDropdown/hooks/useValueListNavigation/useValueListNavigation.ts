import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useMemo } from 'react';

import type { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import type { OptionalListNavigationResult } from '../useListNavigation';
import { useListNavigation } from '../useListNavigation';

import type { AutocompleteMode, ValueOption } from '../../types';
import { DropdownType } from '../../types';
import { getFilteredOrderedOptions, toValueOptions } from '../../utils';

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
