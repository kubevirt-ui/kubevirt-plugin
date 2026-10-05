import { type SelectTypeaheadOptionProps } from './types';

const isSelectableOption = (option: SelectTypeaheadOptionProps): boolean =>
  !option.optionProps?.isDisabled && !option.optionProps?.isAriaDisabled;

type GetEnterKeySelectionParams = {
  canCreate: boolean;
  createActionId: string;
  focusedItem: SelectTypeaheadOptionProps | null;
  inputValue: string;
  isOpen: boolean;
  selectOptions: SelectTypeaheadOptionProps[];
};

export const getEnterKeySelection = ({
  canCreate,
  createActionId,
  focusedItem,
  inputValue,
  isOpen,
  selectOptions,
}: GetEnterKeySelectionParams): number | string | undefined => {
  if (isOpen && focusedItem && isSelectableOption(focusedItem)) {
    return focusedItem.value;
  }

  if (!canCreate || !inputValue) return undefined;

  const createOption = selectOptions.find((option) => option.value === createActionId);
  return createOption && !createOption.optionProps?.isDisabled ? createActionId : undefined;
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
