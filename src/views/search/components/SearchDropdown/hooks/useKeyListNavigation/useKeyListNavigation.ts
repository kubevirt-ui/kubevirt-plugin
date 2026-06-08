import { Dispatch, SetStateAction, useMemo } from 'react';

import { AutocompleteMode, DropdownType, SearchKeyBadge } from '../../types';
import { getFilteredKeyBadges, hasActiveKeyFilter } from '../../utils';
import { OptionalListNavigationResult, useListNavigation } from '../useListNavigation';
import useSearchKeyBadges from '../useSearchKeyBadges';

type UseKeyListNavigationProps = {
  autocompleteMode: AutocompleteMode;
  focusedItemIndex: number;
  onSelectKey: (badge: SearchKeyBadge) => void;
  setFocusedItemIndex: Dispatch<SetStateAction<number>>;
};

export const useKeyListNavigation = ({
  autocompleteMode,
  focusedItemIndex,
  onSelectKey,
  setFocusedItemIndex,
}: UseKeyListNavigationProps): OptionalListNavigationResult => {
  const searchKeyBadges = useSearchKeyBadges();

  const filterText = autocompleteMode.type === DropdownType.KEYS ? autocompleteMode.filterText : '';
  const isActive = autocompleteMode.type === DropdownType.KEYS && hasActiveKeyFilter(filterText);

  const filteredBadges = useMemo(
    () => (isActive ? getFilteredKeyBadges(filterText, searchKeyBadges) : []),
    [isActive, filterText, searchKeyBadges],
  );

  const { onArrowKey, onSelectHighlighted } = useListNavigation(
    filteredBadges,
    focusedItemIndex,
    setFocusedItemIndex,
    onSelectKey,
  );

  return {
    onArrowKey: isActive ? onArrowKey : undefined,
    onSelectHighlighted: isActive ? onSelectHighlighted : undefined,
  };
};
