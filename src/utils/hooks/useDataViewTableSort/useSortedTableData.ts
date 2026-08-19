import { useMemo } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';
import { DataViewSortParams } from '@patternfly/react-data-view';

import { type ColumnConfig } from './types';
import { sortDataViewTableData } from './useDataViewTableSort';

type UseSortedTableDataArgs<TData, TCallbacks = undefined> = {
  callbacks?: TCallbacks;
  columns: ColumnConfig<TData, TCallbacks>[];
  data: TData[];
  initialSortDirection?: 'asc' | 'desc';
  initialSortKey: string;
};

export const useSortedTableData = <TData, TCallbacks = undefined>({
  callbacks,
  columns,
  data,
  initialSortDirection = 'asc',
  initialSortKey,
}: UseSortedTableDataArgs<TData, TCallbacks>): TData[] => {
  const query = useQuery();
  const sortBy = query.get(DataViewSortParams.SORT_BY);
  const sortDirection = query.get(DataViewSortParams.DIRECTION);

  return useMemo(
    () =>
      sortDataViewTableData(
        data ?? [],
        columns,
        sortBy ?? initialSortKey,
        sortDirection ?? initialSortDirection,
        callbacks,
      ),
    [callbacks, columns, data, initialSortDirection, initialSortKey, sortBy, sortDirection],
  );
};
