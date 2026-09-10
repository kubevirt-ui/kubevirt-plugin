import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';

import { OPERATOR_OPTIONS } from '../../constants';
import type { AutocompleteMode, ValueOption } from '../../types';
import { DropdownType } from '../../types';
import type { OptionalListNavigationResult } from '../useListNavigation';
import { useListNavigation } from '../useListNavigation';

type UseOperatorListNavigationProps = {
  autocompleteMode: AutocompleteMode;
  focusedItemIndex: number;
  onSelectOperator: (operator: string) => void;
  setFocusedItemIndex: Dispatch<SetStateAction<number>>;
};

export const useOperatorListNavigation = ({
  autocompleteMode,
  focusedItemIndex,
  onSelectOperator,
  setFocusedItemIndex,
}: UseOperatorListNavigationProps): OptionalListNavigationResult => {
  const onSelect = useCallback(
    (item: ValueOption) => onSelectOperator(item.value),
    [onSelectOperator],
  );

  const { onArrowKey, onSelectHighlighted } = useListNavigation(
    OPERATOR_OPTIONS,
    focusedItemIndex,
    setFocusedItemIndex,
    onSelect,
  );

  const isOperatorsMode = autocompleteMode.type === DropdownType.OPERATORS;

  return {
    onArrowKey: isOperatorsMode ? onArrowKey : undefined,
    onSelectHighlighted: isOperatorsMode ? onSelectHighlighted : undefined,
  };
};
