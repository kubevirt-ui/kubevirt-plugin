import type { ReactNode } from 'react';

import { Checkbox } from '@patternfly/react-core';
import type { DataViewTr } from '@patternfly/react-data-view';

import { PF_TABLE_CHECK_CLASS } from './constants';
import type { ColumnConfig } from './types';

export const renderColumnCell = <TData, TCallbacks = undefined>(
  col: ColumnConfig<TData, TCallbacks>,
  row: TData,
  callbacks?: TCallbacks,
): ReactNode => {
  if (col.renderCell) {
    return callbacks !== undefined
      ? (col.renderCell as (data: TData, cb: TCallbacks) => ReactNode)(row, callbacks)
      : (col.renderCell as (data: TData) => ReactNode)(row);
  }

  return String(col.getValue?.(row, callbacks) ?? '');
};

export type GenerateRowsParams<TData, TCallbacks = undefined> = {
  callbacks: TCallbacks;
  columns: ColumnConfig<TData, TCallbacks>[];
  data: TData[];
  getRowId?: (row: TData) => string;
  isRowSelected?: (row: TData) => boolean;
  onRowSelect?: (row: TData) => void;
  selectable?: boolean;
};

export const generateRows = <TData, TCallbacks = undefined>({
  callbacks,
  columns,
  data,
  getRowId,
  isRowSelected,
  onRowSelect,
  selectable,
}: GenerateRowsParams<TData, TCallbacks>): DataViewTr[] =>
  (data ?? []).map((row, index) => {
    const providedRowId = getRowId?.(row) ?? '';
    const rowId = providedRowId === '' ? String(index) : providedRowId;
    const isSelected = selectable && isRowSelected ? isRowSelected(row) : false;

    const baseCells = columns.map((col) => ({
      cell: renderColumnCell(col, row, callbacks),
      props: col.props,
    }));

    if (selectable) {
      const encodedRowId = encodeURIComponent(rowId);
      const selectionCell = {
        cell: (
          <Checkbox
            aria-label={`Select row ${rowId}`}
            data-test={`select-row-${encodedRowId}`}
            id={`select-row-${encodedRowId}`}
            isChecked={isSelected}
            onChange={() => onRowSelect?.(row)}
          />
        ),
        props: { className: PF_TABLE_CHECK_CLASS },
      };
      return {
        id: rowId,
        props: { isRowSelected: isSelected },
        row: [selectionCell, ...baseCells],
      };
    }

    return {
      id: rowId,
      row: baseCells,
    };
  });
