import {
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getRandomChars } from '@kubevirt-utils/utils/utils';

import { CREATE_NEW, INVALID } from '../utils/constants';
import { getNextArrowIndex } from '../utils/keyboard';
import { buildSelectOptions } from '../utils/options';
import {
  type SelectTypeaheadOptionProps,
  type UseSelectTypeaheadProps,
  type UseSelectTypeaheadResult,
} from '../utils/types';
import { createItemId, getDisplayValue, getSelectedDisplayValue } from '../utils/utils';

export const useSelectTypeahead = ({
  addOption,
  canCreate = false,
  getCreateAction,
  options,
  selectedValue,
  setSelectedValue,
}: UseSelectTypeaheadProps): UseSelectTypeaheadResult => {
  const { t } = useKubevirtTranslation();
  const [randomIdSuffix] = useState(() => getRandomChars());
  const createActionId = `${CREATE_NEW}-${randomIdSuffix}`;
  const invalidActionId = `${INVALID}-${randomIdSuffix}`;
  const listboxId = `select-typeahead-listbox-${randomIdSuffix}`;

  const selected = options.find((option) => option.value === selectedValue);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(() =>
    getSelectedDisplayValue(selectedValue, options),
  );
  const [focusedItemIndex, setFocusedItemIndex] = useState<null | number>(null);
  const [activeItemId, setActiveItemId] = useState<null | string>(null);
  const textInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (isOpen) return;
    setInputValue(getSelectedDisplayValue(selectedValue, options));
  }, [isOpen, options, selectedValue]);

  const selectOptions = buildSelectOptions({
    canCreate,
    createActionId,
    getCreateAction,
    inputValue,
    invalidActionId,
    options,
    selected,
    t,
  });

  const setActiveAndFocusedItem = (itemIndex: number): void => {
    setFocusedItemIndex(itemIndex);
    setActiveItemId(createItemId(selectOptions[itemIndex].value));
  };
  const resetActiveAndFocusedItem = (): void => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };
  const openMenu = (): void => {
    if (!isOpen) setIsOpen(true);
  };
  const closeMenu = (): void => {
    setIsOpen(false);
    resetActiveAndFocusedItem();
  };
  const selectOptionAndClose = (option: SelectTypeaheadOptionProps): void => {
    closeMenu();
    setInputValue(getDisplayValue(option));
    setSelectedValue(option.value);
  };

  const onSelect = (_event: MouseEvent | undefined, value: number | string | undefined): void => {
    if (!value) return;
    if (value === createActionId) {
      const result = addOption?.(inputValue);
      if (result) selectOptionAndClose({ value: typeof result === 'string' ? result : inputValue });
      return;
    }
    const option = options.find((opt) => opt.value === value);
    if (option) selectOptionAndClose(option);
  };
  const onTextInputChange = (_event: FormEvent<HTMLInputElement>, value: string): void => {
    setInputValue(value);
    if (value) openMenu();
    resetActiveAndFocusedItem();
  };
  const handleMenuArrowKeys = (key: string): void => {
    openMenu();
    if (selectOptions.every((opt) => opt.optionProps?.isDisabled)) return;
    setActiveAndFocusedItem(getNextArrowIndex(key, selectOptions, focusedItemIndex));
  };
  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const focusedItem = focusedItemIndex !== null ? selectOptions[focusedItemIndex] : null;
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (isOpen && focusedItem && !focusedItem.optionProps?.isAriaDisabled)
          onSelect(undefined, focusedItem.value);
        openMenu();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };
  const onToggleClick = (): void => {
    setIsOpen((prev) => !prev);
    textInputRef?.current?.focus();
  };
  const onClearButtonClick = (): void => {
    setSelectedValue('');
    setInputValue('');
    resetActiveAndFocusedItem();
    textInputRef?.current?.focus();
  };
  const onOpenChange = (open: boolean): void => {
    if (!open) {
      closeMenu();
      setInputValue(getSelectedDisplayValue(selectedValue, options));
    }
  };

  return {
    activeItemId,
    focusedItemIndex,
    inputValue,
    isOpen,
    listboxId,
    onClearButtonClick,
    onInputKeyDown,
    onOpenChange,
    onSelect,
    onTextInputChange,
    onToggleClick,
    openMenu,
    selectOptions,
    textInputRef,
  };
};
