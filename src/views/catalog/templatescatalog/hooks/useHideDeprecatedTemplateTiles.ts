import { useEffect } from 'react';

import { CREATE_VM_TAB } from '@catalog/CreateVMHorizontalNav/constants';
import { CATALOG_FILTERS } from '@catalog/templatescatalog/utils/consts';
import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';
import { HIDE_DEPRECATED_TEMPLATES } from '@kubevirt-utils/resources/template';

type UseHideDeprecatedTemplateTiles = (
  currentTab: CREATE_VM_TAB,
  onFilterChange: (type: CATALOG_FILTERS, value: boolean | string) => void,
) => void;

const useHideDeprecatedTemplateTiles: UseHideDeprecatedTemplateTiles = (
  currentTab,
  onFilterChange,
) => {
  const { setParam } = useURLParams();

  // This is to select the 'Hide deprecated templates' filter by default
  useEffect(() => {
    if (currentTab !== CREATE_VM_TAB.TEMPLATE) return null;

    onFilterChange(CATALOG_FILTERS.HIDE_DEPRECATED_TEMPLATES, true);

    setParam(HIDE_DEPRECATED_TEMPLATES, 'true');
  }, [currentTab]);
};

export default useHideDeprecatedTemplateTiles;
