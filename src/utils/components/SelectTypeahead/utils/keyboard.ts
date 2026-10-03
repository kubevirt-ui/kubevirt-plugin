import { type SelectTypeaheadOptionProps } from './types';

type HandleEnterKeySelectParams = {
  canCreate: boolean;
  createActionId: string;
  focusedItem: SelectTypeaheadOptionProps | null;
  inputValue: string;
  isOpen: boolean;
  onSelect: (_event: undefined, value: number | string | undefined) => void;
  selectOptions: SelectTypeaheadOptionProps[];
};

export const handleEnterKeySelect = ({
  canCreate,
  createActionId,
  focusedItem,
  inputValue,
  isOpen,
  onSelect,
  selectOptions,
}: HandleEnterKeySelectParams): void => {
  const canSelectFocusedItem =
    isOpen &&
    focusedItem &&
    !focusedItem.optionProps?.isDisabled &&
    !focusedItem.optionProps?.isAriaDisabled;

  if (canSelectFocusedItem) {
    onSelect(undefined, focusedItem.value);
    return;
  }

  if (!canCreate || !inputValue) {
    return;
  }

  const createOption = selectOptions.find((option) => option.value === createActionId);
  if (createOption && !createOption.optionProps?.isDisabled) {
    onSelect(undefined, createActionId);
  }
};

const wrapIndex = (index: number, length: number): number => ((index % length) + length) % length;

const skipDisabled = (
  startIndex: number,
  direction: -1 | 1,
  selectOptions: SelectTypeaheadOptionProps[],
): number => {
  let index = startIndex;
  while (selectOptions[index]?.optionProps?.isDisabled) {
    index = wrapIndex(index + direction, selectOptions.length);
  }
  return index;
};

export const getNextArrowIndex = (
  key: string,
  selectOptions: SelectTypeaheadOptionProps[],
  focusedItemIndex: null | number,
): number => {
  const isUp = key === 'ArrowUp';
  const direction = isUp ? -1 : 1;

  let indexToFocus: number;
  if (isUp) {
    indexToFocus =
      focusedItemIndex === null || focusedItemIndex === 0
        ? selectOptions.length - 1
        : focusedItemIndex - 1;
  } else {
    indexToFocus =
      focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1
        ? 0
        : focusedItemIndex + 1;
  }

  return skipDisabled(indexToFocus, direction, selectOptions);
};
