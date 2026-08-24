import { type SelectTypeaheadOptionProps } from './types';

export const createItemId = (value: string): string =>
  `select-typeahead-${value.replaceAll(' ', '-')}`;

export const getDisplayValue = (option: SelectTypeaheadOptionProps): string =>
  option?.label ?? option?.value ?? '';

export const getSelectedDisplayValue = (
  selectedValue: string,
  options: SelectTypeaheadOptionProps[],
): string => {
  if (!selectedValue) {
    return '';
  }

  const option = options.find((opt) => opt.value === selectedValue);
  return option ? getDisplayValue(option) : selectedValue;
};
