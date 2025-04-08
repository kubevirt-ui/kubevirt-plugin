import React from 'react';

import { CREATE_NEW } from '@kubevirt-utils/components/SelectTypeahead/utils/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { SelectOptionProps } from '@patternfly/react-core';
import { FolderIcon } from '@patternfly/react-icons';

export const getCreateNewFolderOption = (filterValue: string): SelectOptionProps => {
  const filterIsEmpty = isEmpty(filterValue);

  return {
    children: filterIsEmpty
      ? t('Type to create folder')
      : t(`Create folder "{{filterValue}}"`, { filterValue }),
    isDisabled: filterIsEmpty,
    value: CREATE_NEW,
  };
};

export const createNewFolderOption = (filterValue: string): SelectOptionProps => ({
  children: filterValue,
  icon: <FolderIcon />,
  value: filterValue,
});
