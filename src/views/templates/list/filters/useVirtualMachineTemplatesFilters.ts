import { useMemo } from 'react';

import { useClusterFilter } from '@kubevirt-utils/hooks/useClusterFilter';
import { useProjectFilter } from '@kubevirt-utils/hooks/useProjectFilter';
import { type Template, type TemplateOrRequest } from '@kubevirt-utils/resources/template';
import useIsACMPage from '@multicluster/useIsACMPage';
import { type RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { TemplateFilterType } from './types';
import useArchitectureFilter from './useArchitectureFilter';
import useOSFilter from './useOSFilter';
import useProviderFilter from './useProviderFilter';
import useScopeFilter from './useScopeFilter';
import useTypeFilter from './useTypeFilter';

const useVirtualMachineTemplatesFilters = (
  templates: Template[],
): {
  filters: RowFilter<TemplateOrRequest>[];
  filtersWithSelect: RowFilter<TemplateOrRequest>[];
  toolbarFilters: RowFilter<TemplateOrRequest>[];
} => {
  const isACMPage = useIsACMPage();
  const clusterFilter = useClusterFilter();
  const projectFilter = useProjectFilter();

  const typeFilter = useTypeFilter();
  const architectureFilter = useArchitectureFilter(templates);
  const scopeFilter = useScopeFilter();
  const providerFilter = useProviderFilter();
  const osFilter = useOSFilter();

  const filtersWithSelect = useMemo(
    () => (isACMPage ? [clusterFilter, projectFilter] : []),
    [isACMPage, clusterFilter, projectFilter],
  );

  const filters = useMemo<RowFilter<TemplateOrRequest>[]>(
    () => [typeFilter, architectureFilter, scopeFilter, providerFilter, osFilter].filter(Boolean),
    [typeFilter, architectureFilter, scopeFilter, providerFilter, osFilter],
  );

  // Type is controlled by TemplatesTypeToggle; keep it out of the Filter dropdown/chips.
  const toolbarFilters = useMemo(
    () => filters.filter((filter) => filter.type !== TemplateFilterType.Type),
    [filters],
  );

  return useMemo(
    () => ({
      filters,
      filtersWithSelect,
      toolbarFilters,
    }),
    [filters, filtersWithSelect, toolbarFilters],
  );
};

export default useVirtualMachineTemplatesFilters;
