import { useCallback, useMemo } from 'react';

import { addItemsToSelection, removeItemsFromSelection } from '../utils/getBulkSelectedItems';

export type UseTableSelectionProps<TData> = {
  /** Full dataset (sorted but not paginated) - used for validating selected items */
  data: TData[];
  getRowId: (row: TData) => string;
  onSelect: (selected: TData[]) => void;
  /** Current page data - used for allSelected/someSelected state on current page */
  paginatedData: TData[];
  selectedItems: TData[];
};

export type UseTableSelectionResult<TData> = {
  allSelected: boolean;
  handleRowSelect: (row: TData) => void;
  handleSelectAll: () => void;
  isRowSelected: (row: TData) => boolean;
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
    () => new Set(selectedItems.map((item) => getRowId(item))),
    [selectedItems, getRowId],
  );

  // Use full data for validation (prevents clearing selection when changing pages)
  const dataIds = useMemo(() => new Set(data.map((item) => getRowId(item))), [data, getRowId]);

  const validSelectedItems = useMemo(
    () => selectedItems.filter((item) => dataIds.has(getRowId(item))),
    [selectedItems, dataIds, getRowId],
  );

  const isRowSelected = useCallback(
    (row: TData): boolean => selectedIds.has(getRowId(row)),
    [getRowId, selectedIds],
  );

  const handleRowSelect = useCallback(
    (row: TData) => {
      const rowId = getRowId(row);
      const isCurrentlySelected = selectedIds.has(rowId);

      if (isCurrentlySelected) {
        onSelect(selectedItems.filter((item) => getRowId(item) !== rowId));
      } else {
        onSelect([...selectedItems, row]);
      }
    },
    [getRowId, selectedIds, selectedItems, onSelect],
  );

  // Use paginatedData for allSelected/someSelected (reflects current page state)
  const allSelected = useMemo(
    () => paginatedData.length > 0 && paginatedData.every((row) => isRowSelected(row)),
    [paginatedData, isRowSelected],
  );

  const someSelected = useMemo(
    () => paginatedData.some((row) => isRowSelected(row)),
    [paginatedData, isRowSelected],
  );

  // handleSelectAll operates on current page only
  const handleSelectAll = useCallback(() => {
    if (allSelected || someSelected) {
      onSelect(removeItemsFromSelection(selectedItems, paginatedData, getRowId));
    } else {
      onSelect(addItemsToSelection(selectedItems, paginatedData, getRowId));
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
