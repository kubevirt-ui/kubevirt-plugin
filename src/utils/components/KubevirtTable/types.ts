import { ReactNode } from 'react';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';

// Column layout types (for ListPageFilter integration)
export type ColumnLayoutColumn = {
  additional?: boolean;
  id: string;
  title: string;
};

export type ColumnLayout = {
  columns: ColumnLayoutColumn[];
  id: string;
  selectedColumns: Set<string>;
  type: string;
};

// KubevirtTable props types (discriminated union for selectable tables)
type BaseKubevirtTableProps<TData, TCallbacks = undefined> = {
  /** Column keys that should be visible (from user settings). If not provided, shows all non-additional columns */
  activeColumnKeys?: string[];
  ariaLabel: string;
  callbacks?: TCallbacks;
  className?: string;
  columns: ColumnConfig<TData, TCallbacks>[];
  data: TData[];
  dataTest?: string;
  fixedLayout?: boolean;
  getRowId?: (row: TData, index: number) => string;
  initialSortColumnIndex?: number;
  initialSortDirection?: 'asc' | 'desc';
  initialSortKey?: string;
  loaded?: boolean;
  loadError?: unknown;
  noDataMsg?: ReactNode;
  noFilteredDataMsg?: ReactNode;
  /** Pagination state from usePagination hook. When provided, table will slice sorted data accordingly */
  pagination?: PaginationState;
  unfilteredData?: TData[];
};

type NonSelectableTableProps<TData, TCallbacks = undefined> = BaseKubevirtTableProps<
  TData,
  TCallbacks
> & {
  selectable?: false;
};

type SelectableTableProps<TData, TCallbacks = undefined> = BaseKubevirtTableProps<
  TData,
  TCallbacks
> & {
  getRowId: (row: TData, index: number) => string;
  onSelect: (selected: TData[]) => void;
  selectable: true;
  selectedItems: TData[];
  /** Whether to show the "select all" checkbox in the table header. Defaults to true. Set to false when using external BulkSelect. */
  showSelectAllCheckbox?: boolean;
};

export type KubevirtTableProps<TData, TCallbacks = undefined> =
  | NonSelectableTableProps<TData, TCallbacks>
  | SelectableTableProps<TData, TCallbacks>;
