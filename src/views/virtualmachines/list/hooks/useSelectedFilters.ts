import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { TEXT_FILTER_LABELS_ID, TEXT_FILTER_NAME_ID } from './constants';

const useSelectedFilters = (
  rowFilters: RowFilter<V1VirtualMachine>[],
  searchFilters: RowFilter<V1VirtualMachine>[],
) => {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const selectedFilters = rowFilters.map((filter) =>
      searchParams.get(`rowFilter-${filter.type}`) ? filter.type : null,
    );

    selectedFilters.push(
      ...(searchFilters || []).map((filter) =>
        searchParams.get(filter.type) ? filter.type : null,
      ),
    );

    searchParams.get(TEXT_FILTER_NAME_ID) && selectedFilters.push(TEXT_FILTER_NAME_ID);
    searchParams.get(TEXT_FILTER_LABELS_ID) && selectedFilters.push(TEXT_FILTER_LABELS_ID);

    return selectedFilters.filter((f) => Boolean(f));
  }, [searchParams, searchFilters, rowFilters]);
};

export default useSelectedFilters;
