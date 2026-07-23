import React, { useCallback } from 'react';
import { type TFunction } from 'i18next';

import { toTemplateCategoryLabelValue } from '@kubevirt-utils/resources/template/utils/getTemplateCategoryLabel';
import { validateK8sLabelValue } from '@kubevirt-utils/utils/labelValidation/labelValidation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { HelperText, HelperTextItem, type SelectOptionProps } from '@patternfly/react-core';
import { InfoIcon } from '@patternfly/react-icons';

type CreateNewCategoryOption = (filterValue: string, t: TFunction) => SelectOptionProps;

const useCreateNewCategoryOption = (): CreateNewCategoryOption =>
  useCallback((filterValue: string, t: TFunction): SelectOptionProps => {
    const normalized = toTemplateCategoryLabelValue(filterValue);

    if (isEmpty(filterValue) || isEmpty(normalized)) {
      return {
        children: (
          <HelperText>
            <HelperTextItem icon={<InfoIcon />} variant="indeterminate">
              {t('Type to create category')}
            </HelperTextItem>
          </HelperText>
        ),
        isDisabled: true,
      };
    }

    const error = validateK8sLabelValue(normalized, t);
    if (error) {
      return {
        children: (
          <HelperText>
            <HelperTextItem variant="error">{error}</HelperTextItem>
          </HelperText>
        ),
        isDisabled: true,
      };
    }

    return {
      children: t('Create category "{{filterValue}}"', { filterValue: normalized }),
      isDisabled: false,
    };
  }, []);

export default useCreateNewCategoryOption;
