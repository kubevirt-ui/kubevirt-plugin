import { type ReactNode } from 'react';

import { type SortByDirection } from '@patternfly/react-table';

export type ColumnConfig<TData, TCallbacks = undefined> = {
  /** If true, column is hidden by default in column management (user must explicitly enable) */
  additional?: boolean;
  /** Plain value for CSV export and default column sorting when no custom sort is defined. */
  getValue?: (row: TData, callbacks?: TCallbacks) => number | string;
  key: string;
  label: string;
  props?: Record<string, unknown>;
  renderCell: TCallbacks extends undefined
    ? (row: TData) => ReactNode
    : (row: TData, callbacks: TCallbacks) => ReactNode;
  sort?: TCallbacks extends undefined
    ? (data: TData[], direction: SortByDirection) => TData[]
    : (data: TData[], direction: SortByDirection, callbacks?: TCallbacks) => TData[];
  sortable?: boolean;
};

/** Data column for CSV export. `getValue` is required; do not use this on every table. */
export type ExportableColumnConfig<TData, TCallbacks = undefined> = ColumnConfig<
  TData,
  TCallbacks
> & {
  getValue: NonNullable<ColumnConfig<TData, TCallbacks>['getValue']>;
};

export type NonExportableColumnKey = 'actions' | 'selection';

/**
 * Columns passed to CSV export. Labeled data columns must provide `getValue`;
 * actions and selection columns may omit it.
 */
export type TableExportColumnConfig<TData, TCallbacks = undefined> =
  | (ColumnConfig<TData, TCallbacks> & { key: NonExportableColumnKey })
  | ExportableColumnConfig<TData, TCallbacks>;
