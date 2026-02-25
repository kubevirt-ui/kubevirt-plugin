import { useEffect } from 'react';

import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';
import { HIDE_DEPRECATED_TEMPLATES } from '@kubevirt-utils/resources/template';
import { CATALOG_FILTERS } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';

type UseHideDeprecatedTemplateTiles = (
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void,
) => void;

const useHideDeprecatedTemplateTiles: UseHideDeprecatedTemplateTiles = (onFilterChange) => {
  const { params, setParam } = useURLParams();

  // This is to select the 'Hide deprecated templates' filter by default
  useEffect(() => {
    if (!params.has(HIDE_DEPRECATED_TEMPLATES)) {
      onFilterChange(CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES, true);
      setParam(HIDE_DEPRECATED_TEMPLATES, 'true');
    }
  }, [onFilterChange, params, setParam]);
};

export default useHideDeprecatedTemplateTiles;
