import { ReactNode } from 'react';

import { SortByDirection } from '@patternfly/react-table';

export type ColumnConfig<TData, TCallbacks = undefined> = {
  /** If true, column is hidden by default in column management (user must explicitly enable) */
  additional?: boolean;
  getValue?: (row: TData) => number | string;
  key: string;
  label: string;
  props?: Record<string, unknown>;
  renderCell: TCallbacks extends undefined
    ? (row: TData) => ReactNode
    : (row: TData, callbacks: TCallbacks) => ReactNode;
  sort?: (data: TData[], direction: SortByDirection) => TData[];
  sortable?: boolean;
};
