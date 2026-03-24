import { useCallback, useMemo } from 'react';

export type UseTableSelectionProps<TData> = {
  /** Full dataset (sorted but not paginated) - used for validating selected items */
  data: TData[];
  getRowId: (row: TData, index: number) => string;
  onSelect: (selected: TData[]) => void;
  /** Current page data - used for allSelected/someSelected state on current page */
  paginatedData: TData[];
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
  paginatedData,
  selectedItems,
}: UseTableSelectionProps<TData>): UseTableSelectionResult<TData> => {
  const selectedIds = useMemo(
    () => new Set(selectedItems.map((item, index) => getRowId(item, index))),
    [selectedItems, getRowId],
  );

  // Use full data for validation (prevents clearing selection when changing pages)
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

  // Use paginatedData for allSelected/someSelected (reflects current page state)
  const allSelected = useMemo(
    () => paginatedData.length > 0 && paginatedData.every((row, i) => isRowSelected(row, i)),
    [paginatedData, isRowSelected],
  );

  const someSelected = useMemo(
    () => paginatedData.some((row, i) => isRowSelected(row, i)),
    [paginatedData, isRowSelected],
  );

  // handleSelectAll operates on current page only
  const handleSelectAll = useCallback(() => {
    if (allSelected || someSelected) {
      // Deselect only items on current page
      const paginatedIds = new Set(paginatedData.map((item, index) => getRowId(item, index)));
      onSelect(selectedItems.filter((item, i) => !paginatedIds.has(getRowId(item, i))));
    } else {
      // Select all items on current page (add to existing selection)
      const existingIds = new Set(selectedItems.map((item, index) => getRowId(item, index)));
      const newItems = paginatedData.filter(
        (item, index) => !existingIds.has(getRowId(item, index)),
      );
      onSelect([...selectedItems, ...newItems]);
    }
  }, [allSelected, someSelected, onSelect, paginatedData, selectedItems, getRowId]);

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
