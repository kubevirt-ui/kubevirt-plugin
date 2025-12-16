import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { FilterValue, RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { getRowFilterQueryKey } from '@search/utils/query';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

const useFiltersFromURL = (filters: RowFilter<V1VirtualMachine>[]) => {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const staticFilters: { [key: string]: FilterValue } = {};

    const addFilter = (filterKey: string) => {
      const searchParamValue = searchParams.get(getRowFilterQueryKey(filterKey));

      if (searchParamValue) {
        const filterValueType =
          filterKey === VirtualMachineRowFilterType.Labels ? 'all' : 'selected';
        staticFilters[filterKey] = { [filterValueType]: searchParamValue.split(',') };
      }
    };

    for (const filter of filters) {
      addFilter(filter.type);
    }

    addFilter(VirtualMachineRowFilterType.Name);
    addFilter(VirtualMachineRowFilterType.Labels);

    return staticFilters;
  }, [searchParams, filters]);
};

export default useFiltersFromURL;
