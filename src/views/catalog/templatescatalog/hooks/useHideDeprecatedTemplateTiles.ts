import { useEffect } from 'react';

import { CREATE_VM_TAB } from '@catalog/CreateVMHorizontalNav/constants';
import { CATALOG_FILTERS } from '@catalog/templatescatalog/utils/consts';

type UseHideDeprecatedTemplateTiles = (
  currentTab: CREATE_VM_TAB,
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void,
) => void;

const useHideDeprecatedTemplateTiles: UseHideDeprecatedTemplateTiles = (
  currentTab,
  onFilterChange,
) => {
  // This is to select the 'Hide deprecated templates' filter by default
  useEffect(() => {
    if (currentTab !== CREATE_VM_TAB.TEMPLATE) return;

    // onFilterChange already calls setParam internally, so one navigate() is enough.
    onFilterChange(CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);
};

export default useHideDeprecatedTemplateTiles;
