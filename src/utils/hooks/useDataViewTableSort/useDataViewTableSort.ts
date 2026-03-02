import { useCallback, useMemo } from 'react';

import { universalComparator } from '@kubevirt-utils/utils/utils';
import { DataViewTh, useDataViewSort } from '@patternfly/react-data-view';
import { ThProps } from '@patternfly/react-table';

import { useResponsiveColumns } from '../useResponsiveColumns/useResponsiveColumns';

import { ColumnConfig } from './types';

export const useDataViewTableSort = <TData, TCallbacks = undefined>(
  data: TData[],
  columns: ColumnConfig<TData, TCallbacks>[],
  initialSortKey?: string,
  initialSortDirection: 'asc' | 'desc' = 'asc',
): {
  sortedData: TData[];
  tableColumns: DataViewTh[];
  visibleColumns: ColumnConfig<TData, TCallbacks>[];
} => {
  const visibleColumns = useResponsiveColumns(columns);

  const { direction, onSort, sortBy } = useDataViewSort({
    initialSort: { direction: initialSortDirection, sortBy: initialSortKey ?? columns[0]?.key },
  });

  const sortByIndex = useMemo(
    () => visibleColumns.findIndex((col) => col.key === sortBy),
    [sortBy, visibleColumns],
  );

  const getSortParams = useCallback(
    (columnIndex: number): ThProps['sort'] | undefined => {
      if (!visibleColumns[columnIndex]?.sortable) return undefined;
      return {
        columnIndex,
        onSort: (_event, index, dir) => onSort(_event, visibleColumns[index].key, dir),
        sortBy: { defaultDirection: 'asc', direction, index: sortByIndex },
      };
    },
    [visibleColumns, direction, onSort, sortByIndex],
  );

  const tableColumns: DataViewTh[] = useMemo(
    () =>
      visibleColumns.map((col, index) => ({
        cell: col.label,
        props: { ...col.props, sort: getSortParams(index) },
      })),
    [visibleColumns, getSortParams],
  );

  const sortedData = useMemo(() => {
    const column = columns.find((col) => col.key === sortBy);
    const getValue = column?.getValue;
    if (!getValue || !direction) return data;

    return [...data].sort((a, b) => {
      const aVal = getValue(a);
      const bVal = getValue(b);
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : universalComparator(aVal, bVal);
      return direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sortBy, direction, columns]);

  return { sortedData, tableColumns, visibleColumns };
};
