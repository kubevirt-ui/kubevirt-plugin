import type { ReactNode } from 'react';
import React from 'react';

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
  getRowId?: (row: TData, index: number) => string;
  isRowSelected?: (row: TData, index: number) => boolean;
  onRowSelect?: (row: TData, index: number) => void;
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
    const rowId = getRowId?.(row, index) ?? String(index);
    const isSelected = selectable && isRowSelected ? isRowSelected(row, index) : false;

    const baseCells = columns.map((col) => ({
      cell: renderColumnCell(col, row, callbacks),
      props: col.props,
    }));

    if (selectable) {
      const sanitizedRowId = `${rowId.replace(/[^a-zA-Z0-9-_]/g, '-')}-${index}`;
      const selectionCell = {
        cell: (
          <Checkbox
            aria-label={`Select row ${sanitizedRowId}`}
            data-test={`select-row-${sanitizedRowId}`}
            id={`select-row-${sanitizedRowId}`}
            isChecked={isSelected}
            onChange={() => onRowSelect?.(row, index)}
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
