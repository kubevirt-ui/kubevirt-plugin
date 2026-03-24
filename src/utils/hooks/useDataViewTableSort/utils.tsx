import React, { ReactNode } from 'react';

import { Checkbox } from '@patternfly/react-core';
import { DataViewTr } from '@patternfly/react-data-view';

import { PF_TABLE_CHECK_CLASS } from './constants';
import { ColumnConfig } from './types';

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
  data.map((row, index) => {
    const rowId = getRowId?.(row, index) ?? String(index);
    const isSelected = selectable && isRowSelected ? isRowSelected(row, index) : false;

    const baseCells = columns.map((col) => ({
      cell:
        callbacks !== undefined
          ? (col.renderCell as (row: TData, cb: TCallbacks) => ReactNode)(row, callbacks)
          : (col.renderCell as (row: TData) => ReactNode)(row),
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
