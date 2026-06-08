import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { DEFAULT_VISIBLE_EXAMPLES, getSearchExamples } from '../../constants';
import { AutocompleteMode, DropdownType, MainMenuItem, SearchKeyBadge } from '../../types';
import { hasActiveKeyFilter } from '../../utils';
import { OptionalListNavigationResult, useListNavigation } from '../useListNavigation';
import useSearchKeyBadges from '../useSearchKeyBadges';

type UseDefaultMenuNavigationProps = {
  autocompleteMode: AutocompleteMode;
  focusedItemIndex: number;
  onSelectKey: (badge: SearchKeyBadge) => void;
  onSelectQueryText: (query: string) => void;
  recentSearches: string[];
  setFocusedItemIndex: Dispatch<SetStateAction<number>>;
  showAllExamples: boolean;
};

export const useDefaultMenuNavigation = ({
  autocompleteMode,
  focusedItemIndex,
  onSelectKey,
  onSelectQueryText,
  recentSearches,
  setFocusedItemIndex,
  showAllExamples,
}: UseDefaultMenuNavigationProps): OptionalListNavigationResult => {
  const { t } = useKubevirtTranslation();
  const searchKeyBadges = useSearchKeyBadges();

  const isActive =
    autocompleteMode.type === DropdownType.KEYS && !hasActiveKeyFilter(autocompleteMode.filterText);

  const searchExamples = useMemo(() => getSearchExamples(t), [t]);
  const visibleExamples = useMemo(
    () => (showAllExamples ? searchExamples : searchExamples.slice(0, DEFAULT_VISIBLE_EXAMPLES)),
    [showAllExamples, searchExamples],
  );

  const items: MainMenuItem[] = useMemo(() => {
    if (!isActive) return [];

    const keyItems: MainMenuItem[] = searchKeyBadges.map((badge) => ({
      isKey: true,
      value: badge,
    }));
    const recentItems: MainMenuItem[] = recentSearches.map((query) => ({
      isKey: false,
      value: query,
    }));
    const exampleItems: MainMenuItem[] = visibleExamples.map(({ query }) => ({
      isKey: false,
      value: query,
    }));

    return [...keyItems, ...recentItems, ...exampleItems];
  }, [isActive, searchKeyBadges, recentSearches, visibleExamples]);

  const onSelect = useCallback(
    (item: MainMenuItem) =>
      item.isKey === true ? onSelectKey(item.value) : onSelectQueryText(item.value),
    [onSelectKey, onSelectQueryText],
  );

  const { onArrowKey, onSelectHighlighted } = useListNavigation(
    items,
    focusedItemIndex,
    setFocusedItemIndex,
    onSelect,
  );

  return {
    onArrowKey: isActive ? onArrowKey : undefined,
    onSelectHighlighted: isActive ? onSelectHighlighted : undefined,
  };
};
