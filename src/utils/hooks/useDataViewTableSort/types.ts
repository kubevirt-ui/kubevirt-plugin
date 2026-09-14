import type { ReactNode } from 'react';

import type { SortByDirection } from '@patternfly/react-table';

type ColumnRenderCell<TData, TCallbacks> = TCallbacks extends undefined
  ? (row: TData) => ReactNode
  : (row: TData, callbacks: TCallbacks) => ReactNode;

type ColumnGetValue<TData, TCallbacks> = (row: TData, callbacks?: TCallbacks) => number | string;

type ColumnConfigBase<TData, TCallbacks> = {
  /** If true, column is hidden by default in column management (user must explicitly enable) */
  additional?: boolean;
  key: string;
  label: string;
  props?: Record<string, unknown>;
  sort?: (data: TData[], direction: SortByDirection, callbacks?: TCallbacks) => TData[];
  sortable?: boolean;
};

/**
 * Table column. Provide `getValue` for plain text (CSV and the cell share it);
 * provide `renderCell` when the cell needs custom markup. At least one is required.
 */
export type ColumnConfig<TData, TCallbacks = undefined> = ColumnConfigBase<TData, TCallbacks> &
  (
    | {
        getValue: ColumnGetValue<TData, TCallbacks>;
        renderCell?: ColumnRenderCell<TData, TCallbacks>;
      }
    | {
        getValue?: ColumnGetValue<TData, TCallbacks>;
        renderCell: ColumnRenderCell<TData, TCallbacks>;
      }
  );

/** Data column for CSV export. `getValue` is required; do not use this on every table. */
export type ExportableColumnConfig<TData, TCallbacks = undefined> = ColumnConfig<
  TData,
  TCallbacks
> & {
  getValue: ColumnGetValue<TData, TCallbacks>;
};

export type NonExportableColumnKey = 'actions' | 'selection';

/**
 * Columns passed to CSV export. Labeled data columns must provide `getValue`;
 * actions and selection columns may omit it.
 */
export type TableExportColumnConfig<TData, TCallbacks = undefined> =
  | (ColumnConfig<TData, TCallbacks> & { key: NonExportableColumnKey })
  | ExportableColumnConfig<TData, TCallbacks>;
