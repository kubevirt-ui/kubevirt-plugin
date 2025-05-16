import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import { ResetTextSearch, TextFiltersType } from '@kubevirt-utils/components/ListPageFilter/types';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { AdvancedSearchInputs } from '../utils/types';

type UseNavigateToSearchResults = (
  onFilterChange: OnFilterChange,
  resetTextSearch?: ResetTextSearch,
) => (searchInputs: AdvancedSearchInputs) => void;

export const useNavigateToSearchResults: UseNavigateToSearchResults = (
  onFilterChange,
  resetTextSearch,
) => {
  const navigate = useNavigate();
  const { setAllQueryArguments } = useQueryParamsMethods();

  const resetCurrentFilter = useCallback(() => {
    Object.values(VirtualMachineRowFilterType).forEach((type) => {
      onFilterChange(type, { selected: [] });
    });
    onFilterChange(STATIC_SEARCH_FILTERS.name, { selected: [] });
    onFilterChange(STATIC_SEARCH_FILTERS.labels, { all: [] });
  }, [onFilterChange]);

  const applyFilter = useCallback(
    ({
      dateCreatedFrom,
      dateCreatedTo,
      description,
      ip,
      labels,
      memory,
      name,
      projects,
      vCPU,
    }: AdvancedSearchInputs) => {
      resetCurrentFilter();

      const textFilters = {
        ...(name ? { [STATIC_SEARCH_FILTERS.name]: name } : {}),
        ...(description ? { [VirtualMachineRowFilterType.Description]: description } : {}),
        ...(ip ? { [VirtualMachineRowFilterType.IP]: ip } : {}),
      };

      resetTextSearch?.({
        ...textFilters,
        [STATIC_SEARCH_FILTERS.labels]: labels,
      } as TextFiltersType);

      setAllQueryArguments({
        ...textFilters,
        ...(labels?.length > 0 ? { [STATIC_SEARCH_FILTERS.labels]: labels.join(',') } : {}),
        ...(projects?.length > 0
          ? { [VirtualMachineRowFilterType.Project]: projects.join(',') }
          : {}),
        ...(dateCreatedFrom
          ? { [VirtualMachineRowFilterType.DateCreatedFrom]: dateCreatedFrom }
          : {}),
        ...(dateCreatedTo ? { [VirtualMachineRowFilterType.DateCreatedTo]: dateCreatedTo } : {}),
        ...(!isNaN(vCPU?.value)
          ? { [VirtualMachineRowFilterType.CPU]: `${vCPU.operator} ${vCPU.value}` }
          : {}),
        ...(!isNaN(memory?.value)
          ? {
              [VirtualMachineRowFilterType.Memory]: `${memory.operator} ${memory.value} ${memory.unit}`,
            }
          : {}),
      });
    },
    [setAllQueryArguments, resetCurrentFilter, resetTextSearch],
  );

  return useCallback(
    (searchInputs) => {
      navigate(`/k8s/all-namespaces/${VirtualMachineModelRef}/search`);
      applyFilter(searchInputs);
    },
    [navigate, applyFilter],
  );
};
