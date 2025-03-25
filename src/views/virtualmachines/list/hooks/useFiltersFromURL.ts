import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { FilterValue, RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { TEXT_FILTER_LABELS_ID, TEXT_FILTER_NAME_ID } from './constants';

const useFiltersFromURL = (
  rowFilters: RowFilter<V1VirtualMachine>[],
  otherFilters: RowFilter<V1VirtualMachine>[],
) => {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const staticFilters: { [key: string]: FilterValue } = {};

    const addFilter = (
      filterKey: string,
      searchParamPreposition = '',
      filterValueType = 'selected',
    ) => {
      const searchParamValue = searchParams.get(`${searchParamPreposition}${filterKey}`);

      if (searchParamValue) {
        staticFilters[filterKey] = { [filterValueType]: searchParamValue.split(',') };
      }
    };

    for (const filter of rowFilters) {
      addFilter(filter.type, 'rowFilter-');
    }

    for (const filter of otherFilters) {
      addFilter(filter.type);
    }

    addFilter(TEXT_FILTER_NAME_ID);
    addFilter(TEXT_FILTER_LABELS_ID, '', 'all');

    return staticFilters;
  }, [searchParams, otherFilters, rowFilters]);
};

export default useFiltersFromURL;
