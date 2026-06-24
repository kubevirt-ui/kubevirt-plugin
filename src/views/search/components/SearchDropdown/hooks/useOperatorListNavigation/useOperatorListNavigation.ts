import { Dispatch, SetStateAction, useCallback } from 'react';

import { OPERATOR_OPTIONS } from '../../constants';
import { AutocompleteMode, DropdownType, ValueOption } from '../../types';
import { OptionalListNavigationResult, useListNavigation } from '../useListNavigation';

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
