import { useMemo } from 'react';

import useClusterFilter from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useClusterFilter';
import useProjectFilter from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useProjectFilter';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useIsVMTemplateFeatureEnabled from '@kubevirt-utils/hooks/useVMTemplateFeatureFlag/useIsVMTemplateFeatureEnabled';
import { type Template, type TemplateOrRequest } from '@kubevirt-utils/resources/template';
import useIsACMPage from '@multicluster/useIsACMPage';

import useArchitectureFilter from './useArchitectureFilter';
import useCategoryFilter from './useCategoryFilter';
import useOSFilter from './useOSFilter';
import useProviderFilter from './useProviderFilter';
import useScopeFilter from './useScopeFilter';
import useTypeFilter from './useTypeFilter';

const useVirtualMachineTemplatesFilters = (
  templates: Template[],
): KubevirtFilter<TemplateOrRequest>[] => {
  const isACMPage = useIsACMPage();
  const { featureEnabled: vmTemplatesEnabled } = useIsVMTemplateFeatureEnabled();
  const clusterFilter = useClusterFilter();
  const projectFilter = useProjectFilter();

  const typeFilter = useTypeFilter();
  const architectureFilter = useArchitectureFilter(templates);
  const categoryFilter = useCategoryFilter(vmTemplatesEnabled ? templates : []);
  const scopeFilter = useScopeFilter();
  const providerFilter = useProviderFilter();
  const osFilter = useOSFilter();

  return useMemo<KubevirtFilter<TemplateOrRequest>[]>(
    () =>
      [
        ...(isACMPage ? [clusterFilter, projectFilter] : []),
        typeFilter,
        architectureFilter,
        vmTemplatesEnabled ? categoryFilter : null,
        scopeFilter,
        providerFilter,
        osFilter,
      ].filter(Boolean),
    [
      isACMPage,
      clusterFilter,
      projectFilter,
      typeFilter,
      architectureFilter,
      vmTemplatesEnabled,
      categoryFilter,
      scopeFilter,
      providerFilter,
      osFilter,
    ],
  );
};

export default useVirtualMachineTemplatesFilters;
