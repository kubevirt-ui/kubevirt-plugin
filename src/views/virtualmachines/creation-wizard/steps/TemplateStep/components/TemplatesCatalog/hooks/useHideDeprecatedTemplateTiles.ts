import { useEffect } from 'react';

import { CATALOG_FILTERS } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';

type UseHideDeprecatedTemplateTiles = (
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void,
) => void;

const useHideDeprecatedTemplateTiles: UseHideDeprecatedTemplateTiles = (onFilterChange) => {
  // Set 'Hide deprecated templates' filter by default on mount only. onFilterChange already calls setParam internally, so one navigate is enough.
  useEffect(() => {
    onFilterChange(CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useHideDeprecatedTemplateTiles;
