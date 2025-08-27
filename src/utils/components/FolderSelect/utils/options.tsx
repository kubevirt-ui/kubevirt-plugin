import React from 'react';
import { TFunction } from 'react-i18next';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { HelperText, HelperTextItem, SelectOptionProps } from '@patternfly/react-core';
import { FolderIcon, InfoIcon } from '@patternfly/react-icons';

import { getCreationNotAllowedMessage } from './validation';

export const getCreateNewFolderOption = (filterValue: string, t: TFunction): SelectOptionProps => {
  const filterIsEmpty = isEmpty(filterValue);
  if (filterIsEmpty) {
    return {
      children: (
        <HelperText>
          <HelperTextItem icon={<InfoIcon />} variant="indeterminate">
            {t('Type to create folder')}
          </HelperTextItem>
        </HelperText>
      ),
      isDisabled: true,
    };
  }

  const errorMessage = getCreationNotAllowedMessage(filterValue);
  if (errorMessage) {
    return {
      children: (
        <HelperText>
          <HelperTextItem variant="error">{errorMessage}</HelperTextItem>
        </HelperText>
      ),
      isDisabled: true,
    };
  }

  return {
    children: t(`Create folder "{{filterValue}}"`, { filterValue }),
    isDisabled: false,
  };
};

export const createNewFolderOption = (filterValue: string): SelectOptionProps => ({
  children: filterValue,
  icon: <FolderIcon />,
  value: filterValue,
});
