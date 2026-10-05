import { getRandomChars } from '@kubevirt-utils/utils/utils';

import { CREATE_NEW, INVALID } from './constants';
import { type SelectTypeaheadOptionProps } from './types';

export type SelectTypeaheadIds = {
  createActionId: string;
  invalidActionId: string;
  listboxId: string;
};

export const createSelectTypeaheadIds = (): SelectTypeaheadIds => {
  const suffix = getRandomChars();
  return {
    createActionId: `${CREATE_NEW}-${suffix}`,
    invalidActionId: `${INVALID}-${suffix}`,
    listboxId: `select-typeahead-listbox-${suffix}`,
  };
};

export const createItemId = (value: string): string =>
  `select-typeahead-${value.replaceAll(' ', '-')}`;

export const getDisplayValue = (option: SelectTypeaheadOptionProps): string =>
  option?.label ?? option?.value ?? '';

export const getSelectedDisplayValue = (
  selectedValue: string | undefined,
  options: SelectTypeaheadOptionProps[],
): string => {
  if (!selectedValue) {
    return '';
  }

  const option = options.find((opt) => opt.value === selectedValue);
  return option ? getDisplayValue(option) : selectedValue;
};
