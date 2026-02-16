import { ReactNode, useMemo } from 'react';

import { useDataViewSort } from '@patternfly/react-data-view';
import { DataViewTh, DataViewTr } from '@patternfly/react-data-view';
import { ThProps } from '@patternfly/react-table';

export type ColumnConfig<TData, TCallbacks = undefined> = {
  getValue?: (row: TData) => number | string;
  key: string;
  label: string;
  props?: Record<string, unknown>;
  renderCell: TCallbacks extends undefined
    ? (row: TData) => ReactNode
    : (row: TData, callbacks: TCallbacks) => ReactNode;
  sortable?: boolean;
};

export const generateRows = <TData, TCallbacks = undefined>(
  data: TData[],
  columns: ColumnConfig<TData, TCallbacks>[],
  callbacks: TCallbacks,
  getRowId?: (row: TData, index: number) => string,
): DataViewTr[] =>
  data.map((row, index) => ({
    id: getRowId?.(row, index) || String(index),
    row: columns.map((col) => ({
      cell:
        callbacks !== undefined
          ? (col.renderCell as (row: TData, cb: TCallbacks) => ReactNode)(row, callbacks)
          : (col.renderCell as (row: TData) => ReactNode)(row),
      props: col.props,
    })),
  }));

export const useDataViewTableSort = <TData, TCallbacks = undefined>(
  data: TData[],
  columns: ColumnConfig<TData, TCallbacks>[],
  initialSortKey?: string,
): { sortedData: TData[]; tableColumns: DataViewTh[] } => {
  const { direction, onSort, sortBy } = useDataViewSort({
    initialSort: { direction: 'asc', sortBy: initialSortKey || columns[0]?.key },
  });

  const sortByIndex = useMemo(
    () => columns.findIndex((col) => col.key === sortBy),
    [sortBy, columns],
  );

  const getSortParams = (columnIndex: number): ThProps['sort'] | undefined => {
    if (!columns[columnIndex]?.sortable) return undefined;
    return {
      columnIndex,
      onSort: (_event, index, dir) => onSort(_event, columns[index].key, dir),
      sortBy: { defaultDirection: 'asc', direction, index: sortByIndex },
    };
  };

  const tableColumns: DataViewTh[] = useMemo(
    () =>
      columns.map((col, index) => ({
        cell: col.label,
        props: { ...col.props, sort: getSortParams(index) },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, sortByIndex, direction],
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
          : String(aVal).localeCompare(String(bVal));
      return direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sortBy, direction, columns]);

  return { sortedData, tableColumns };
};
