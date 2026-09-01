/* eslint-disable */
import { useCallback, useMemo } from 'react';

import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { type Template, type TemplateOrRequest } from '@kubevirt-utils/resources/template/utils';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { TemplateFilterType } from '../filters/types';
import useVirtualMachineTemplatesFilters from '../filters/useVirtualMachineTemplatesFilters';

type UseVirtualMachineTemplatesListFiltersResult = {
  clearAllFilters: () => void;
  /** All filter definitions (for TemplatesFilter custom menu content). */
  filterDefinitions: KubevirtFilter<TemplateOrRequest>[];
  filteredData: TemplateOrRequest[];
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
  /** Filter definitions excluding Type (for KubevirtFilterToolbar chip rendering). */
  toolbarFilterDefinitions: KubevirtFilter<TemplateOrRequest>[];
};

const useVirtualMachineTemplatesListFilters = (
  allTemplates: Template[],
  allTemplatesWithRequests: TemplateOrRequest[],
): UseVirtualMachineTemplatesListFiltersResult => {
  const filterDefinitions = useVirtualMachineTemplatesFilters(allTemplates);

  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: allTemplatesWithRequests,
    filterDefinitions,
  });

  // Type is controlled by TemplatesTypeToggle; preserve it on "Clear all filters".
  const clearAllFiltersExceptType = useCallback(() => {
    const typeValue = filters[TemplateFilterType.Type];
    clearAllFilters();
    if (!isEmpty(typeValue)) {
      onSetFilters({ [TemplateFilterType.Type]: typeValue });
    }
  }, [clearAllFilters, filters, onSetFilters]);

  // Type is controlled by TemplatesTypeToggle; keep it out of toolbar chips.
  const toolbarFilterDefinitions = useMemo(
    () => filterDefinitions.filter((f) => f.id !== TemplateFilterType.Type),
    [filterDefinitions],
  );

  return {
    clearAllFilters: clearAllFiltersExceptType,
    filterDefinitions,
    filteredData,
    filters,
    onSetFilters,
    toolbarFilterDefinitions,
  };
};

export default useVirtualMachineTemplatesListFilters;
