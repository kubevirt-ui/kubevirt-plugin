import { type SelectTypeaheadOptionProps } from './types';

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
