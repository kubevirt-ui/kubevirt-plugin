import React, { ReactNode } from 'react';

import { Checkbox } from '@patternfly/react-core';
import { DataViewTr } from '@patternfly/react-data-view';

import { ColumnConfig } from './types';

export const generateRows = <TData, TCallbacks = undefined>(
  data: TData[],
  columns: ColumnConfig<TData, TCallbacks>[],
  callbacks: TCallbacks,
  getRowId?: (row: TData, index: number) => string,
  selectable?: boolean,
  isRowSelected?: (row: TData, index: number) => boolean,
  onRowSelect?: (row: TData, index: number) => void,
): DataViewTr[] =>
  data.map((row, index) => {
    const rowId = getRowId?.(row, index) ?? String(index);
    const isSelected = selectable && isRowSelected ? isRowSelected(row, index) : false;

    const baseCells = columns.map((col) => ({
      cell:
        callbacks != null
          ? (col.renderCell as (row: TData, cb: TCallbacks) => ReactNode)(row, callbacks)
          : (col.renderCell as (row: TData) => ReactNode)(row),
      props: col.props,
    }));

    if (selectable) {
      const sanitizedRowId = rowId.replace(/[^a-zA-Z0-9-_]/g, '-');
      const selectionCell = {
        cell: (
          <Checkbox
            aria-label={`Select row ${rowId}`}
            data-test={`select-row-${sanitizedRowId}`}
            id={`select-row-${sanitizedRowId}`}
            isChecked={isSelected}
            onChange={() => onRowSelect?.(row, index)}
          />
        ),
        props: { className: 'pf-v6-c-table__check' },
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
