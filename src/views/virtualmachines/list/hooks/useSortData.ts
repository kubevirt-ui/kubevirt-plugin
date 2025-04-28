import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { DataViewSortParams } from '@patternfly/react-data-view';
import { SortByDirection } from '@patternfly/react-table';

const useSortData = (
  data: V1VirtualMachine[],
  activeColumns: TableColumn<K8sResourceCommon>[],
  pagination: PaginationState,
): V1VirtualMachine[] => {
  const [searchParams] = useSearchParams();

  const sortBy = searchParams.get(DataViewSortParams.SORT_BY);
  const direction = searchParams.get(DataViewSortParams.DIRECTION);

  const sortFunction = useMemo(
    () =>
      activeColumns?.find((column) => column.title === sortBy)?.sort as (
        data: V1VirtualMachine[],
        sortDirection: SortByDirection,
      ) => V1VirtualMachine[],
    [sortBy, activeColumns],
  );

  return useMemo(
    () =>
      sortFunction
        ? sortFunction(data, direction as SortByDirection)?.slice(
            pagination.startIndex,
            pagination.endIndex,
          )
        : data?.slice(pagination.startIndex, pagination.endIndex),
    [sortFunction, data, direction, pagination.startIndex, pagination.endIndex],
  );
};

export default useSortData;
