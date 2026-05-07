import { useEffect, useRef } from 'react';

import { UniversalFilter } from '@kubevirt-utils/hooks/useUniversalFilter/useUniversalFilter';
import { TemplateFilterType } from '@templates/list/filters/types';
import { TEMPLATE_SCOPE_ID } from '@templates/list/filters/useScopeFilter';

const useFilterDefaultTemplates = (
  shouldApplyFilter: boolean,
  universalFilter: UniversalFilter,
) => {
  const defaultAppliedRef = useRef(false);
  const { hasQueryKey, setValue } = universalFilter;

  useEffect(() => {
    if (defaultAppliedRef.current || !shouldApplyFilter) return;

    defaultAppliedRef.current = true;

    if (!hasQueryKey(TemplateFilterType.TemplateScope)) {
      setValue(TemplateFilterType.TemplateScope, TEMPLATE_SCOPE_ID.DEFAULT);
    }
  }, [shouldApplyFilter, hasQueryKey, setValue]);
};

export default useFilterDefaultTemplates;
