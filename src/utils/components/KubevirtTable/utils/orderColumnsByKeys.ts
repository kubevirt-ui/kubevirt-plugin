import type { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';

const reorderColumns = <T>(columns: T[], savedIds: string[], getId: (column: T) => string): T[] => {
  const uniqueSavedIds = savedIds.filter((id, index) => savedIds.indexOf(id) === index);

  const columnsInSavedOrder = uniqueSavedIds
    .map((id) => columns.find((column) => getId(column) === id))
    .filter((column): column is T => column != null);

  const columnsNotInSavedOrder = columns.filter((column) => !savedIds.includes(getId(column)));

  return [...columnsInSavedOrder, ...columnsNotInSavedOrder];
};

export const orderColumnsByKeys = <TData, TCallbacks = undefined>(
  columns: ColumnConfig<TData, TCallbacks>[],
  orderedKeys?: string[],
): ColumnConfig<TData, TCallbacks>[] =>
  orderedKeys?.length ? reorderColumns(columns, orderedKeys, (column) => column.key) : columns;

/** Same as orderColumnsByKeys but matches items by `id` (Console TableColumn shape). */
export const orderColumnsByIds = <T extends { id: string }>(
  columns: T[],
  orderedIds?: string[],
): T[] =>
  orderedIds?.length ? reorderColumns(columns, orderedIds, (column) => column.id) : columns;
