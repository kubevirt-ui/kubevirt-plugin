import { KeyboardEvent, useCallback, useState } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { KeyTypes } from '@patternfly/react-core';

import { AutocompleteMode, SearchKeyBadge } from '../../types';
import { useDefaultMenuNavigation } from '../useDefaultMenuNavigation/useDefaultMenuNavigation';
import { useKeyListNavigation } from '../useKeyListNavigation/useKeyListNavigation';
import { useOperatorListNavigation } from '../useOperatorListNavigation/useOperatorListNavigation';
import { useValueListNavigation } from '../useValueListNavigation/useValueListNavigation';

type UseDropdownNavigationProps = {
  autocompleteMode: AutocompleteMode;
  filterDefinitions: KubevirtFilter[];
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSelectKey: (badge: SearchKeyBadge) => void;
  onSelectOperator: (operator: string) => void;
  onSelectQueryText: (query: string) => void;
  onSelectValue: (value: string) => void;
  recentSearches: string[];
  showAllExamples: boolean;
};

type UseDropdownNavigationResult = {
  focusedItemIndex: number;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  resetFocusedItem: () => void;
};

export const useDropdownNavigation = ({
  autocompleteMode,
  filterDefinitions,
  onInputKeyDown,
  onSelectKey,
  onSelectOperator,
  onSelectQueryText,
  onSelectValue,
  recentSearches,
  showAllExamples,
}: UseDropdownNavigationProps): UseDropdownNavigationResult => {
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1);

  const props = { autocompleteMode, focusedItemIndex, setFocusedItemIndex };

  const { onArrowKey: onValueArrowKey, onSelectHighlighted: onValueSelectHighlighted } =
    useValueListNavigation({
      filterDefinitions,
      onSelectValue,
      ...props,
    });

  const { onArrowKey: onOperatorArrowKey, onSelectHighlighted: onOperatorSelectHighlighted } =
    useOperatorListNavigation({
      onSelectOperator,
      ...props,
    });

  const { onArrowKey: onKeyArrowKey, onSelectHighlighted: onKeySelectHighlighted } =
    useKeyListNavigation({
      onSelectKey,
      ...props,
    });

  const { onArrowKey: onDefaultArrowKey, onSelectHighlighted: onDefaultSelectHighlighted } =
    useDefaultMenuNavigation({
      onSelectKey,
      onSelectQueryText,
      recentSearches,
      showAllExamples,
      ...props,
    });

  const onArrowKey = onValueArrowKey ?? onOperatorArrowKey ?? onKeyArrowKey ?? onDefaultArrowKey;
  const onSelectHighlighted =
    onValueSelectHighlighted ??
    onOperatorSelectHighlighted ??
    onKeySelectHighlighted ??
    onDefaultSelectHighlighted;

  const resetFocusedItem = useCallback(() => setFocusedItemIndex(-1), []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (
        event.key === KeyTypes.ArrowDown ||
        event.key === KeyTypes.ArrowUp ||
        event.key === KeyTypes.ArrowLeft ||
        event.key === KeyTypes.ArrowRight
      ) {
        if (onArrowKey?.(event)) return;
      }

      if (event.key === KeyTypes.Enter || event.key === KeyTypes.Tab) {
        if (onSelectHighlighted?.()) {
          event.preventDefault();
          return;
        }
      }

      onInputKeyDown(event);
    },
    [onArrowKey, onSelectHighlighted, onInputKeyDown],
  );

  return { focusedItemIndex, handleKeyDown, resetFocusedItem };
};
