import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  isCommonTemplate,
  isDefaultVariantTemplate,
  isOpenShiftTemplate,
  TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import { includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter, RowFilterItem } from '@openshift-console/dynamic-plugin-sdk';

import { TemplateFilterType } from './types';

export const TEMPLATE_SCOPE_ID = {
  DEFAULT: 'default',
  NONE: 'none',
  USER: 'user',
} as const;

const getTemplateScope = (obj: TemplateOrRequest): string => {
  if (!isOpenShiftTemplate(obj)) return TEMPLATE_SCOPE_ID.NONE;
  if (isDefaultVariantTemplate(obj)) return TEMPLATE_SCOPE_ID.DEFAULT;
  if (!isCommonTemplate(obj)) return TEMPLATE_SCOPE_ID.USER;
  return TEMPLATE_SCOPE_ID.NONE;
};

const useScopeFilter = (): RowFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  const items: RowFilterItem[] = useMemo(
    () => [
      { id: TEMPLATE_SCOPE_ID.DEFAULT, title: t('Default templates') },
      { id: TEMPLATE_SCOPE_ID.USER, title: t('User templates') },
    ],
    [t],
  );

  return useMemo(
    () => ({
      filter: (input, obj) =>
        !isOpenShiftTemplate(obj) || includeFilter(input, items, getTemplateScope(obj)),
      filterGroupName: t('Template scope'),
      items,
      reducer: (obj) => getTemplateScope(obj),
      type: TemplateFilterType.TemplateScope,
    }),
    [items, t],
  );
};

export default useScopeFilter;
