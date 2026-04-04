import { useMemo } from 'react';

import { useClusterFilter } from '@kubevirt-utils/hooks/useClusterFilter';
import { useProjectFilter } from '@kubevirt-utils/hooks/useProjectFilter';
import { TemplateOrRequest } from '@kubevirt-utils/resources/template';
import useIsACMPage from '@multicluster/useIsACMPage';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import useArchitectureFilter from './useArchitectureFilter';
import useOSFilter from './useOSFilter';
import useProviderFilter from './useProviderFilter';
import useTypeFilter from './useTypeFilter';

const useVirtualMachineTemplatesFilters = (
  templates: TemplateOrRequest[],
): {
  filters: RowFilter<TemplateOrRequest>[];
  filtersWithSelect: RowFilter<TemplateOrRequest>[];
} => {
  const isACMPage = useIsACMPage();
  const clusterFilter = useClusterFilter();
  const projectFilter = useProjectFilter();

  const typeFilter = useTypeFilter();
  const architectureFilter = useArchitectureFilter(templates);
  const providerFilter = useProviderFilter();
  const osFilter = useOSFilter();

  const filtersWithSelect = useMemo(
    () => (isACMPage ? [clusterFilter, projectFilter] : []),
    [isACMPage, clusterFilter, projectFilter],
  );

  const filters = useMemo<RowFilter<TemplateOrRequest>[]>(
    () => [typeFilter, architectureFilter, providerFilter, osFilter].filter(Boolean),
    [typeFilter, architectureFilter, providerFilter, osFilter],
  );

  return useMemo(() => {
    return {
      filters,
      filtersWithSelect,
    };
  }, [filters, filtersWithSelect]);
};

export default useVirtualMachineTemplatesFilters;
