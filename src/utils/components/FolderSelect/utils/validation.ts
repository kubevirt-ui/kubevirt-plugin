import { type TFunction } from 'i18next';

import { MAX_LABEL_LENGTH } from '@kubevirt-utils/utils/labelValidation/constants';
import { type MenuToggleProps } from '@patternfly/react-core';

const isValidFolderNameRegex = /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;
const startsCorrectlyRegex = /(^$)|(^[A-Za-z0-9])/;

const findInvalidCharacter = (input: string): string | undefined => {
  return input.split('').find((char) => /[^-A-Za-z0-9_.]/.test(char));
};

const getFolderNameByteLength = (value: string): number => new TextEncoder().encode(value).length;

export const hasFolderNameValidationError = (filterValue: string): boolean => {
  if (!filterValue) {
    return false;
  }

  if (findInvalidCharacter(filterValue)) {
    return true;
  }

  if (!startsCorrectlyRegex.test(filterValue)) {
    return true;
  }

  if (!isValidFolderNameRegex.test(filterValue)) {
    return true;
  }

  return getFolderNameByteLength(filterValue) > MAX_LABEL_LENGTH;
};

export const getFolderNameValidationError = (
  filterValue: string,
  t: TFunction,
): string | undefined => {
  if (!filterValue) {
    return undefined;
  }

  const invalidCharacter = findInvalidCharacter(filterValue);

  if (invalidCharacter) {
    return invalidCharacter.trim() === ''
      ? t('Spaces are not allowed')
      : t('Invalid character: {{invalidCharacter}}', { invalidCharacter });
  }

  if (!startsCorrectlyRegex.test(filterValue)) {
    return t("Group name can't start with {{character}}", { character: filterValue[0] });
  }

  if (!isValidFolderNameRegex.test(filterValue)) {
    return t("Group name can't end with {{character}}", {
      character: filterValue[filterValue.length - 1],
    });
  }

  if (getFolderNameByteLength(filterValue) > MAX_LABEL_LENGTH) {
    return t('Group name must be {{max}} bytes or fewer', { max: MAX_LABEL_LENGTH });
  }

  return undefined;
};

export const isValidFolderName = (filterValue: string): boolean =>
  !hasFolderNameValidationError(filterValue);

export const getToggleStatus = (filterValue: string): MenuToggleProps['status'] => {
  if (hasFolderNameValidationError(filterValue)) {
    return 'danger';
  }
};
