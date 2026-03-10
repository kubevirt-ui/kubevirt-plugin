import { ReactNode } from 'react';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';

type BaseKubevirtTableProps<TData, TCallbacks = undefined> = {
  ariaLabel: string;
  callbacks?: TCallbacks;
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
};

export type KubevirtTableProps<TData, TCallbacks = undefined> =
  | NonSelectableTableProps<TData, TCallbacks>
  | SelectableTableProps<TData, TCallbacks>;
