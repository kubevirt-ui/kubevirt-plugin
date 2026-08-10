import { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  isCommonTemplate,
  isDefaultVariantTemplate,
  isOpenShiftTemplate,
  TemplateOrRequest,
} from '@kubevirt-utils/resources/template';

import { TemplateFilterType } from './types';

export const TEMPLATE_SCOPE_ID = {
  ALL: 'all',
  DEFAULT: 'default',
  USER: 'user',
} as const;

const getTemplateScope = (obj: TemplateOrRequest): string => {
  if (!isOpenShiftTemplate(obj)) return TEMPLATE_SCOPE_ID.ALL;
  if (isDefaultVariantTemplate(obj)) return TEMPLATE_SCOPE_ID.DEFAULT;
  if (!isCommonTemplate(obj)) return TEMPLATE_SCOPE_ID.USER;
  return TEMPLATE_SCOPE_ID.ALL;
};

const useScopeFilter = (): KubevirtFilter<TemplateOrRequest> => {
  const { t } = useKubevirtTranslation();

  return useMemo(
    () => ({
      categoryLabel: t('Template scope'),
      id: TemplateFilterType.TemplateScope,
      match: (obj, selected) =>
        !isOpenShiftTemplate(obj) || selected.includes(getTemplateScope(obj)),
      options: [
        { label: t('Default templates'), value: TEMPLATE_SCOPE_ID.DEFAULT },
        { label: t('User templates'), value: TEMPLATE_SCOPE_ID.USER },
      ],
    }),
    [t],
  );
};

export default useScopeFilter;
