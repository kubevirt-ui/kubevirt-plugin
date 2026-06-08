import { Dispatch, KeyboardEvent, SetStateAction, useCallback } from 'react';

import { KeyTypes } from '@patternfly/react-core';

export type UseListNavigationResult = {
  onArrowKey: (event: KeyboardEvent<HTMLInputElement>) => boolean;
  onSelectHighlighted: () => boolean;
};

export type OptionalListNavigationResult = {
  [K in keyof UseListNavigationResult]: undefined | UseListNavigationResult[K];
};

export const useListNavigation = <T>(
  items: T[],
  focusedItemIndex: number,
  setFocusedItemIndex: Dispatch<SetStateAction<number>>,
  onSelect: (item: T) => void,
): UseListNavigationResult => {
  const onArrowKey = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): boolean => {
      const count = items.length;
      if (count === 0) return false;

      if (event.key === KeyTypes.ArrowDown) {
        event.preventDefault();
        setFocusedItemIndex((prev) => (prev + 1) % count);
        return true;
      }
      if (event.key === KeyTypes.ArrowUp) {
        event.preventDefault();
        setFocusedItemIndex((prev) => (prev <= 0 ? count - 1 : prev - 1));
        return true;
      }
      return false;
    },
    [items.length, setFocusedItemIndex],
  );

  const onSelectHighlighted = useCallback((): boolean => {
    if (focusedItemIndex < 0) return false;

    const item = items[focusedItemIndex];
    if (item) {
      onSelect(item);
      setFocusedItemIndex(-1);
      return true;
    }
    return false;
  }, [focusedItemIndex, items, onSelect, setFocusedItemIndex]);

  return { onArrowKey, onSelectHighlighted };
};
