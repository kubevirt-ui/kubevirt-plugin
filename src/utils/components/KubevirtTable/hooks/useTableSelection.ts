import { useCallback, useMemo } from 'react';

export type UseTableSelectionProps<TData> = {
  data: TData[];
  getRowId: (row: TData, index: number) => string;
  onSelect: (selected: TData[]) => void;
  selectedItems: TData[];
};

export type UseTableSelectionResult<TData> = {
  allSelected: boolean;
  handleRowSelect: (row: TData, index: number) => void;
  handleSelectAll: () => void;
  isRowSelected: (row: TData, index: number) => boolean;
  selectedIds: Set<string>;
  someSelected: boolean;
  validSelectedItems: TData[];
};

export const useTableSelection = <TData>({
  data,
  getRowId,
  onSelect,
  selectedItems,
}: UseTableSelectionProps<TData>): UseTableSelectionResult<TData> => {
  const selectedIds = useMemo(
    () => new Set(selectedItems.map((item, index) => getRowId(item, index))),
    [selectedItems, getRowId],
  );

  const dataIds = useMemo(
    () => new Set(data.map((item, index) => getRowId(item, index))),
    [data, getRowId],
  );

  const validSelectedItems = useMemo(
    () => selectedItems.filter((item, index) => dataIds.has(getRowId(item, index))),
    [selectedItems, dataIds, getRowId],
  );

  const isRowSelected = useCallback(
    (row: TData, index: number): boolean => selectedIds.has(getRowId(row, index)),
    [getRowId, selectedIds],
  );

  const handleRowSelect = useCallback(
    (row: TData, index: number) => {
      const rowId = getRowId(row, index);
      const isCurrentlySelected = selectedIds.has(rowId);

      if (isCurrentlySelected) {
        onSelect(selectedItems.filter((item, i) => getRowId(item, i) !== rowId));
      } else {
        onSelect([...selectedItems, row]);
      }
    },
    [getRowId, selectedIds, selectedItems, onSelect],
  );

  const allSelected = useMemo(
    () => data.length > 0 && data.every((row, i) => isRowSelected(row, i)),
    [data, isRowSelected],
  );

  const someSelected = useMemo(
    () => data.some((row, i) => isRowSelected(row, i)),
    [data, isRowSelected],
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected || someSelected) {
      onSelect([]);
    } else {
      onSelect(data);
    }
  }, [allSelected, someSelected, onSelect, data]);

  return {
    allSelected,
    handleRowSelect,
    handleSelectAll,
    isRowSelected,
    selectedIds,
    someSelected,
    validSelectedItems,
  };
};
