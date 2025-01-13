import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { SelectOptionProps } from '@patternfly/react-core';

import { CREATE_NEW } from './constants';
export const createItemId = (value: any) => `select-typeahead-${value?.replace(' ', '-')}`;

export const getCreateNewFolderOption = (filterValue: string): SelectOptionProps => ({
  children: t(`Create folder "{{filterValue}}"`, { filterValue }),
  isDisabled: isEmpty(filterValue),
  value: CREATE_NEW,
});
