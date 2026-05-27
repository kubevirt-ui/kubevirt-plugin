import { useMemo } from 'react';

import { useClusterFilter } from '@kubevirt-utils/hooks/useClusterFilter';
import { useNamespaceFilter } from '@kubevirt-utils/hooks/useNamespaceFilter';
import { Template, TemplateOrRequest } from '@kubevirt-utils/resources/template';
import useIsACMPage from '@multicluster/useIsACMPage';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

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
} => {
  const isACMPage = useIsACMPage();
  const clusterFilter = useClusterFilter();
  const namespaceFilter = useNamespaceFilter();

  const typeFilter = useTypeFilter();
  const architectureFilter = useArchitectureFilter(templates);
  const scopeFilter = useScopeFilter();
  const providerFilter = useProviderFilter();
  const osFilter = useOSFilter();

  const filtersWithSelect = useMemo(
    () => (isACMPage ? [clusterFilter, namespaceFilter] : []),
    [isACMPage, clusterFilter, namespaceFilter],
  );

  const filters = useMemo<RowFilter<TemplateOrRequest>[]>(
    () => [typeFilter, architectureFilter, scopeFilter, providerFilter, osFilter].filter(Boolean),
    [typeFilter, architectureFilter, scopeFilter, providerFilter, osFilter],
  );

  return useMemo(() => {
    return {
      filters,
      filtersWithSelect,
    };
  }, [filters, filtersWithSelect]);
};

export default useVirtualMachineTemplatesFilters;
