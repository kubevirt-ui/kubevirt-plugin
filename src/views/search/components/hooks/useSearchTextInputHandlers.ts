import { type FormEvent, type KeyboardEvent, type RefObject, useCallback, useRef } from 'react';

import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { type KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useCursorTracking from '@search/hooks/useCursorTracking';

import { useDropdownNavigation } from '../SearchDropdown/hooks/useDropdownNavigation/useDropdownNavigation';
import { type AutocompleteMode, DropdownType, type SearchKeyBadge } from '../SearchDropdown/types';

type UseSearchTextInputHandlersArgs = {
  autocompleteMode: AutocompleteMode;
  displayText: string;
  filterDefinitions: KubevirtFilter[];
  inputRef: RefObject<HTMLInputElement>;
  onChange: (event: FormEvent<HTMLInputElement>, value: string) => void;
  onCloseDropdown: () => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onOpenAdvancedSearch: () => void;
  onSelectKey: (badge: SearchKeyBadge) => void;
  onSelectOperator: (operator: string) => void;
  onSelectQueryText: (query: string) => void;
  onSelectValue: (value: string) => void;
  recentSearches: string[];
  setDraftText: (value: string) => void;
  showAllExamples: boolean;
  toggleRef: RefObject<HTMLDivElement>;
};

type UseSearchTextInputHandlersResult = {
  focusedItemIndex: number;
  handleAdvancedSearchClick: () => void;
  handleChange: (event: FormEvent<HTMLInputElement>, value: string) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  shouldShowDropdown: (isDropdownOpen: boolean) => boolean;
};

export const useSearchTextInputHandlers = ({
  autocompleteMode,
  displayText,
  filterDefinitions,
  inputRef,
  onChange,
  onCloseDropdown,
  onInputKeyDown,
  onOpenAdvancedSearch,
  onSelectKey,
  onSelectOperator,
  onSelectQueryText,
  onSelectValue,
  recentSearches,
  setDraftText,
  showAllExamples,
  toggleRef,
}: UseSearchTextInputHandlersArgs): UseSearchTextInputHandlersResult => {
  const menuRef = useRef<HTMLDivElement>(null);

  const { handleCursorChange } = useCursorTracking({
    displayText,
    inputRef,
    setDraftText,
  });

  const { focusedItemIndex, handleKeyDown, resetFocusedItem } = useDropdownNavigation({
    autocompleteMode,
    filterDefinitions,
    onInputKeyDown,
    onSelectKey,
    onSelectOperator,
    onSelectQueryText,
    onSelectValue,
    recentSearches,
    showAllExamples,
  });

  const handleChange = useCallback(
    (event: FormEvent<HTMLInputElement>, value: string): void => {
      handleCursorChange(event);
      resetFocusedItem();
      onChange(event, value);
    },
    [handleCursorChange, resetFocusedItem, onChange],
  );

  useClickOutside([toggleRef, menuRef], onCloseDropdown);

  const handleAdvancedSearchClick = useCallback((): void => {
    onCloseDropdown();
    onOpenAdvancedSearch();
  }, [onCloseDropdown, onOpenAdvancedSearch]);

  const shouldShowDropdown = (isDropdownOpen: boolean): boolean =>
    isDropdownOpen && autocompleteMode.type !== DropdownType.HIDDEN;

  return {
    focusedItemIndex,
    handleAdvancedSearchClick,
    handleChange,
    handleKeyDown,
    shouldShowDropdown,
  };
};
