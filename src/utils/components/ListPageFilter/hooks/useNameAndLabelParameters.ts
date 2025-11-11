import { useMemo } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { STATIC_SEARCH_FILTERS_LABELS } from '../constants';
import { FilterInfo } from '../types';

export const useNameAndLabelParameters = () => {
  const queryParams = useQuery();

  const filtersObject = useMemo(() => {
    const filters: Record<string, FilterInfo> = {};

    const nameQuery = queryParams.get(VirtualMachineRowFilterType.Name);
    const labelsQuery = queryParams.get(VirtualMachineRowFilterType.Labels);

    filters[VirtualMachineRowFilterType.Name] = {
      filterGroupName: STATIC_SEARCH_FILTERS_LABELS.name,
      query: nameQuery,
    };

    filters[VirtualMachineRowFilterType.Labels] = {
      filterGroupName: STATIC_SEARCH_FILTERS_LABELS.labels,
      query: labelsQuery,
    };

    return filters;
  }, [queryParams]);

  return filtersObject;
};
