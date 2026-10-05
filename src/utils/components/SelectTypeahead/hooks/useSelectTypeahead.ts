import {
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getEnterKeySelection } from '../utils/keyboard';
import { buildSelectOptions } from '../utils/options';
import {
  type SelectTypeaheadOptionProps,
  type UseSelectTypeaheadProps,
  type UseSelectTypeaheadResult,
} from '../utils/types';
import { createSelectTypeaheadIds, getDisplayValue, getSelectedDisplayValue } from '../utils/utils';
import { useSelectTypeaheadMenu } from './useSelectTypeaheadMenu';

export const useSelectTypeahead = ({
  addOption,
  canCreate = false,
  getCreateAction,
  options,
  selectedValue,
  setSelectedValue,
}: UseSelectTypeaheadProps): UseSelectTypeaheadResult => {
  const { t } = useKubevirtTranslation();
  const [{ createActionId, invalidActionId, listboxId }] = useState(createSelectTypeaheadIds);

  const selected = options.find((option) => option.value === selectedValue);
  const [inputValue, setInputValue] = useState<string>(() =>
    getSelectedDisplayValue(selectedValue, options),
  );
  const textInputRef = useRef<HTMLInputElement>();

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

  const {
    activeItemId,
    closeMenu,
    focusedItemIndex,
    handleMenuArrowKeys,
    isOpen,
    openMenu,
    resetActiveAndFocusedItem,
    setIsOpen,
  } = useSelectTypeaheadMenu({ selectOptions });

  useEffect(() => {
    if (isOpen) return;
    setInputValue(getSelectedDisplayValue(selectedValue, options));
  }, [isOpen, options, selectedValue]);

  const selectOptionAndClose = (option: SelectTypeaheadOptionProps): void => {
    closeMenu();
    setInputValue(getDisplayValue(option));
    setSelectedValue(option.value);
  };

  const onSelect = (_event: MouseEvent | undefined, value: number | string | undefined): void => {
    if (value === undefined) return;
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

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    switch (event.key) {
      case 'Enter': {
        event.preventDefault();
        const focusedItem = focusedItemIndex !== null ? selectOptions[focusedItemIndex] : null;
        const value = getEnterKeySelection({
          canCreate,
          createActionId,
          focusedItem,
          inputValue,
          isOpen,
          selectOptions,
        });
        if (value !== undefined) onSelect(undefined, value);
        openMenu();
        break;
      }
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
