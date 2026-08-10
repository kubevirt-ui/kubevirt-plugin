import { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getAvailableTemplateCategories,
  getTemplateCategory,
  isVirtualMachineTemplate,
  type Template,
  type TemplateOrRequest,
} from '@kubevirt-utils/resources/template';

import { TemplateFilterType } from './types';

export const TEMPLATE_CATEGORY_FILTER_ALL = 'all';

const useCategoryFilter = (templates: Template[]): KubevirtFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  const options = useMemo(
    () =>
      getAvailableTemplateCategories(templates)
        .map((category) => ({
          label: category,
          value: category,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [templates],
  );

  return useMemo(
    () => ({
      categoryLabel: t('Category'),
      id: TemplateFilterType.Category,
      match: (obj, selected): boolean => {
        if (!isVirtualMachineTemplate(obj)) {
          return false;
        }
        return selected.includes(getTemplateCategory(obj) ?? '');
      },
      options,
    }),
    [options, t],
  );
};

export default useCategoryFilter;
