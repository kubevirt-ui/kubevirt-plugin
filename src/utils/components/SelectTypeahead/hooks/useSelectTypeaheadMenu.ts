import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';

import { addEscapeCaptureListener } from '../utils/escapeCapture';
import { getNextArrowIndex } from '../utils/keyboard';
import { type SelectTypeaheadOptionProps } from '../utils/types';
import { createItemId } from '../utils/utils';

type UseSelectTypeaheadMenuParams = {
  selectOptions: SelectTypeaheadOptionProps[];
};

type UseSelectTypeaheadMenuResult = {
  activeItemId: null | string;
  closeMenu: () => void;
  focusedItemIndex: null | number;
  handleMenuArrowKeys: (key: string) => void;
  isOpen: boolean;
  openMenu: () => void;
  resetActiveAndFocusedItem: () => void;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const useSelectTypeaheadMenu = ({
  selectOptions,
}: UseSelectTypeaheadMenuParams): UseSelectTypeaheadMenuResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState<null | number>(null);
  const [activeItemId, setActiveItemId] = useState<null | string>(null);

  const resetActiveAndFocusedItem = useCallback((): void => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  }, [setFocusedItemIndex, setActiveItemId]);

  const closeMenu = useCallback((): void => {
    setIsOpen(false);
    resetActiveAndFocusedItem();
  }, [resetActiveAndFocusedItem, setIsOpen]);

  const openMenu = useCallback((): void => {
    if (!isOpen) setIsOpen(true);
  }, [isOpen, setIsOpen]);

  const setActiveAndFocusedItem = useCallback(
    (itemIndex: number): void => {
      setFocusedItemIndex(itemIndex);
      setActiveItemId(createItemId(selectOptions[itemIndex].value));
    },
    [selectOptions, setFocusedItemIndex, setActiveItemId],
  );

  const handleMenuArrowKeys = useCallback(
    (key: string): void => {
      openMenu();
      if (selectOptions.every((opt) => opt.optionProps?.isDisabled)) return;
      setActiveAndFocusedItem(getNextArrowIndex(key, selectOptions, focusedItemIndex));
    },
    [selectOptions, focusedItemIndex, openMenu, setActiveAndFocusedItem],
  );

  useEffect(() => {
    if (!isOpen) return;
    return addEscapeCaptureListener(closeMenu);
  }, [isOpen, closeMenu]);

  return {
    activeItemId,
    closeMenu,
    focusedItemIndex,
    handleMenuArrowKeys,
    isOpen,
    openMenu,
    resetActiveAndFocusedItem,
    setIsOpen,
  };
};
