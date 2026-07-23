import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getAvailableTemplateCategories,
  getTemplateCategory,
  isVirtualMachineTemplate,
  type Template,
  type TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import { includeFilter } from '@kubevirt-utils/utils/utils';
import { type RowFilter, type RowFilterItem } from '@openshift-console/dynamic-plugin-sdk';

import { TemplateFilterType } from './types';

export const TEMPLATE_CATEGORY_FILTER_ALL = 'all';

const useCategoryFilter = (templates: Template[]): RowFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  const items: RowFilterItem[] = useMemo(
    () =>
      getAvailableTemplateCategories(templates)
        .map((category) => ({
          id: category,
          title: category,
        }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [templates],
  );

  return useMemo(
    () => ({
      filter: (selectedCategories, obj): boolean => {
        if (!selectedCategories.selected?.length) {
          return true;
        }

        if (!isVirtualMachineTemplate(obj)) {
          return false;
        }

        return includeFilter(selectedCategories, items, getTemplateCategory(obj) ?? '');
      },
      filterGroupName: t('VM templates'),
      items,
      reducer: (obj): string =>
        isVirtualMachineTemplate(obj) ? (getTemplateCategory(obj) ?? '') : '',
      type: TemplateFilterType.Category,
    }),
    [items, t],
  );
};

export default useCategoryFilter;
