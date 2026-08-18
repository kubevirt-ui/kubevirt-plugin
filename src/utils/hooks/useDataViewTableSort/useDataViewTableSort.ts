import { useCallback, useMemo } from 'react';

import { universalComparator } from '@kubevirt-utils/utils/utils';
import { useDataViewSort } from '@patternfly/react-data-view';
import { type DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable';
import { type SortByDirection, type ThProps } from '@patternfly/react-table';

import { useResponsiveColumns } from '../useResponsiveColumns/useResponsiveColumns';
import { type ColumnConfig } from './types';

export const sortDataViewTableData = <TData, TCallbacks = undefined>(
  data: TData[],
  columns: ColumnConfig<TData, TCallbacks>[],
  sortBy?: string,
  direction?: string,
  callbacks?: TCallbacks,
): TData[] => {
  const column = columns.find((col) => col.key === sortBy);
  if (!direction) return data;

  if (column?.sort) {
    return column.sort([...data], direction as SortByDirection, callbacks);
  }

  const getValue = column?.getValue;
  if (!getValue) return data;

  return [...data].sort((a, b) => {
    const aVal = getValue(a, callbacks);
    const bVal = getValue(b, callbacks);
    const cmp =
      typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : universalComparator(aVal, bVal);
    return direction === 'asc' ? cmp : -cmp;
  });
};

export const useDataViewTableSort = <TData, TCallbacks = undefined>(
  data: TData[],
  columns: ColumnConfig<TData, TCallbacks>[],
  initialSortKey?: string,
  initialSortDirection: 'asc' | 'desc' = 'asc',
  callbacks?: TCallbacks,
  searchParams?: URLSearchParams,
  setSearchParams?: (params: URLSearchParams) => void,
): {
  sortedData: TData[];
  tableColumns: DataViewTh[];
  visibleColumns: ColumnConfig<TData, TCallbacks>[];
} => {
  const visibleColumns = useResponsiveColumns(columns);

  const { direction, onSort, sortBy } = useDataViewSort({
    initialSort: { direction: initialSortDirection, sortBy: initialSortKey ?? columns[0]?.key },
    searchParams,
    setSearchParams,
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

  const sortedData = useMemo(
    () => sortDataViewTableData(data, columns, sortBy, direction, callbacks),
    [data, sortBy, direction, columns, callbacks],
  );

  return { sortedData, tableColumns, visibleColumns };
};
