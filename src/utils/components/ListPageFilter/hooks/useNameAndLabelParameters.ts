import { useMemo } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { STATIC_SEARCH_FILTERS_LABELS } from '../constants';
import { FilterInfo } from '../types';

export const useLabelParameter = () => {
  const queryParams = useQuery();

  const filtersObject = useMemo(() => {
    const filters: Record<string, FilterInfo> = {};

    const labelsQuery = queryParams.get(VirtualMachineRowFilterType.Labels);

    filters[VirtualMachineRowFilterType.Labels] = {
      filterGroupName: STATIC_SEARCH_FILTERS_LABELS.labels,
      query: labelsQuery,
    };

    return filters;
  }, [queryParams]);

  return filtersObject;
};
