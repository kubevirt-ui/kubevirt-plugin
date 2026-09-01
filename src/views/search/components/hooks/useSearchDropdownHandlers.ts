import { type RefObject, useCallback, useRef, useState } from 'react';

import {
  type KubevirtFilter,
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useCursorTracking from '@search/hooks/useCursorTracking';
import { useSearchLanguageDropdown } from '@search/searchLanguage/hooks/useSearchLanguageDropdown/useSearchLanguageDropdown';

import { useAutocompleteMode } from '../SearchDropdown/hooks/useAutocompleteMode/useAutocompleteMode';
import { type AutocompleteMode, type SearchKeyBadge } from '../SearchDropdown/types';

type UseSearchDropdownHandlersArgs = {
  displayText: string;
  filterDefinitions: KubevirtFilter[];
  filters: KubevirtFilterState;
  inputRef: RefObject<HTMLInputElement>;
  onSetFilters: OnSetFilters;
  setDraftText: (value: string) => void;
  trackKey: (key: string) => void;
};

type UseSearchDropdownHandlersResult = {
  autocompleteMode: AutocompleteMode;
  menuRef: RefObject<HTMLDivElement>;
  onSelectKey: (badge: SearchKeyBadge) => void;
  onSelectOperator: (operator: string) => void;
  onSelectValue: (value: string) => void;
  onToggleShowAllExamples: () => void;
  showAllExamples: boolean;
  updateCursorPosition: () => void;
};

export const useSearchDropdownHandlers = ({
  displayText,
  filterDefinitions,
  filters,
  inputRef,
  onSetFilters,
  setDraftText,
  trackKey,
}: UseSearchDropdownHandlersArgs): UseSearchDropdownHandlersResult => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showAllExamples, setShowAllExamples] = useState(false);
  const onToggleShowAllExamples = useCallback(() => setShowAllExamples((prev) => !prev), []);

  const { setDraftTextWithCursor, tokenParts, updateCursorPosition } = useCursorTracking({
    displayText,
    inputRef,
    setDraftText,
  });

  const autocompleteMode = useAutocompleteMode(tokenParts.token, filterDefinitions);

  const { onSelectKey, onSelectOperator, onSelectValue } = useSearchLanguageDropdown({
    autocompleteMode,
    filters,
    onSetFilters,
    setDraftTextWithCursor,
    tokenParts,
    trackKey,
  });

  return {
    autocompleteMode,
    menuRef,
    onSelectKey,
    onSelectOperator,
    onSelectValue,
    onToggleShowAllExamples,
    showAllExamples,
    updateCursorPosition,
  };
};
