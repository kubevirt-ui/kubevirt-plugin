import React from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { MenuToggleProps } from '@patternfly/react-core';

const isValidFolderNameRegex = /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;
const startsCorrectlyRegex = /(^$)|(^[A-Za-z0-9])/;

const findInvalidCharacter = (input: string) => {
  return input.split('').find((char) => /[^-A-Za-z0-9_.]/.test(char));
};

export const getCreationNotAllowedMessage = (filterValue: string) => {
  const invalidCharacter = findInvalidCharacter(filterValue);

  if (invalidCharacter) {
    return (
      <>
        {invalidCharacter.trim() === ''
          ? t('Spaces are not allowed')
          : t('Invalid character: {{invalidCharacter}}', { invalidCharacter })}
      </>
    );
  }

  if (!startsCorrectlyRegex.test(filterValue)) {
    return (
      <>
        {t("Folder name can't start with")} {filterValue[0]}
      </>
    );
  }

  if (!isValidFolderNameRegex.test(filterValue)) {
    return (
      <>
        {t("Folder name can't end with")} {filterValue[filterValue.length - 1]}
      </>
    );
  }

  return null;
};

export const getToggleStatus = (filterValue: string): MenuToggleProps['status'] => {
  if (findInvalidCharacter(filterValue)) {
    return 'danger';
  }
};
