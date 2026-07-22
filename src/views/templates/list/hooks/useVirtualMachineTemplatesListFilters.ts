import { useMemo } from 'react';

import useFiltersFromURL from '@kubevirt-utils/hooks/useFiltersFromURL';
import { type Template, type TemplateOrRequest } from '@kubevirt-utils/resources/template/utils';
import {
  type OnFilterChange,
  type RowFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

import useVirtualMachineTemplatesFilters from '../filters/useVirtualMachineTemplatesFilters';

type UseVirtualMachineTemplatesListFiltersResult = {
  filteredData: TemplateOrRequest[];
  filtersWithSelect: RowFilter<TemplateOrRequest>[];
  onFilterChange: OnFilterChange;
  toolbarFilters: RowFilter<TemplateOrRequest>[];
  unfilteredData: TemplateOrRequest[];
};

const useVirtualMachineTemplatesListFilters = (
  allTemplates: Template[],
  allTemplatesWithRequests: TemplateOrRequest[],
  nameFilter?: string,
): UseVirtualMachineTemplatesListFiltersResult => {
  const { filters, filtersWithSelect, toolbarFilters } =
    useVirtualMachineTemplatesFilters(allTemplates);

  const allFilters = useMemo(
    () => [...filters, ...filtersWithSelect],
    [filters, filtersWithSelect],
  );

  const filtersFromURL = useFiltersFromURL(allFilters);

  const staticFilters = useMemo(
    () => ({
      ...filtersFromURL,
      ...(nameFilter && { name: { selected: [nameFilter] } }),
    }),
    [filtersFromURL, nameFilter],
  );

  // eslint-disable-next-line @typescript-eslint/no-deprecated -- migrate to Data View in a follow-up
  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(
    allTemplatesWithRequests,
    allFilters,
    staticFilters,
  );

  return {
    filteredData,
    filtersWithSelect,
    onFilterChange,
    toolbarFilters,
    unfilteredData,
  };
};

export default useVirtualMachineTemplatesListFilters;
