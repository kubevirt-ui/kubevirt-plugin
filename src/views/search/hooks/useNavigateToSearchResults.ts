import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { useQueryParamsMethods } from '@kubevirt-utils/components/ListPageFilter/hooks/useQueryParamsMethods';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { AdvancedSearchInputs } from '../utils/types';

type UseNavigateToSearchResults = () => (searchInputs: AdvancedSearchInputs) => void;

export const useNavigateToSearchResults: UseNavigateToSearchResults = () => {
  const navigate = useNavigate();
  const { setAllQueryArguments } = useQueryParamsMethods();

  const applyFilter = useCallback(
    ({ description, ip, labels, name, projects }: AdvancedSearchInputs) => {
      // TODO: support all available search inputs (Date, vCPU, Memory)
      setAllQueryArguments({
        ...(name ? { [STATIC_SEARCH_FILTERS.name]: name } : {}),
        ...(labels?.length > 0 ? { [STATIC_SEARCH_FILTERS.labels]: labels.join(',') } : {}),
        ...(description ? { [VirtualMachineRowFilterType.Description]: description } : {}),
        ...(ip ? { [VirtualMachineRowFilterType.IP]: ip } : {}),
        ...(projects?.length > 0
          ? { [VirtualMachineRowFilterType.Project]: projects.join(',') }
          : {}),
      });
    },
    [setAllQueryArguments],
  );

  return useCallback(
    (searchInputs) => {
      navigate(`/k8s/all-namespaces/${VirtualMachineModelRef}/search`);
      applyFilter(searchInputs);
    },
    [navigate, applyFilter],
  );
};
