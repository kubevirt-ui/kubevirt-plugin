import { useEffect, useMemo } from 'react';

import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { generateRows } from '@kubevirt-utils/hooks/useDataViewTableSort/utils';
import { type DataViewTr } from '@patternfly/react-data-view';
import { type DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable';

import { useSelectionColumn } from './useSelectionColumn';
import { useTableSelection } from './useTableSelection';

const defaultGetRowId = (_row: unknown): string => '';
const defaultOnSelect = (_items: unknown[]): void => {};

type UseKubevirtTableRowsInput<TData, TCallbacks> = {
  callbacks?: TCallbacks;
  dataTest?: string;
  getRowId?: (row: TData) => string;
  isSelectable: boolean;
  onSelect?: (selected: TData[]) => void;
  paginatedData: TData[];
  selectedItems: TData[];
  showSelectAllCheckbox: boolean;
  sortedData: TData[];
  visibleColumns: ColumnConfig<TData, TCallbacks>[];
};

type UseKubevirtTableRowsResult = {
  effectiveTableColumns: DataViewTh[];
  rows: DataViewTr[];
};

export const useKubevirtTableRows = <TData, TCallbacks = undefined>(
  input: UseKubevirtTableRowsInput<TData, TCallbacks>,
  tableColumns: DataViewTh[],
): UseKubevirtTableRowsResult => {
  const {
    callbacks,
    dataTest,
    getRowId,
    isSelectable,
    onSelect,
    paginatedData,
    selectedItems,
    showSelectAllCheckbox,
    sortedData,
    visibleColumns,
  } = input;

  const {
    allSelected,
    handleRowSelect,
    handleSelectAll,
    isRowSelected,
    someSelected,
    validSelectedItems,
  } = useTableSelection<TData>({
    data: sortedData,
    getRowId: getRowId ?? defaultGetRowId,
    onSelect: (onSelect ?? defaultOnSelect) as (selected: TData[]) => void,
    paginatedData,
    selectedItems,
  });

  useEffect(() => {
    if (!onSelect || validSelectedItems.length === selectedItems.length) return;
    onSelect(validSelectedItems);
  }, [onSelect, validSelectedItems, selectedItems.length]);

  const rows: DataViewTr[] = useMemo(
    () =>
      generateRows({
        callbacks: callbacks as TCallbacks,
        columns: visibleColumns,
        data: paginatedData,
        getRowId,
        isRowSelected,
        onRowSelect: handleRowSelect,
        selectable: isSelectable,
      }),
    [
      paginatedData,
      visibleColumns,
      callbacks,
      getRowId,
      isSelectable,
      isRowSelected,
      handleRowSelect,
    ],
  );

  const selectionColumn = useSelectionColumn({
    allSelected,
    dataTest,
    handleSelectAll,
    showSelectAllCheckbox: isSelectable && showSelectAllCheckbox,
    someSelected,
  });

  const effectiveTableColumns = useMemo(
    () => (isSelectable ? [selectionColumn as DataViewTh, ...tableColumns] : tableColumns),
    [isSelectable, selectionColumn, tableColumns],
  );

  return { effectiveTableColumns, rows };
};
