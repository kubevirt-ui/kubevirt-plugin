import type { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';

export const orderColumnsByKeys = <TData, TCallbacks = undefined>(
  columns: ColumnConfig<TData, TCallbacks>[],
  orderedKeys?: string[],
): ColumnConfig<TData, TCallbacks>[] => {
  if (!orderedKeys?.length) {
    return columns;
  }

  const columnByKey = new Map(columns.map((col) => [col.key, col]));
  const ordered: ColumnConfig<TData, TCallbacks>[] = [];

  for (const key of orderedKeys) {
    const column = columnByKey.get(key);
    if (column) {
      ordered.push(column);
      columnByKey.delete(key);
    }
  }

  for (const column of columns) {
    if (columnByKey.has(column.key)) {
      ordered.push(column);
    }
  }

  return ordered;
};

/** Same as orderColumnsByKeys but matches items by `id` (Console TableColumn shape). */
export const orderColumnsByIds = <T extends { id: string }>(
  columns: T[],
  orderedIds?: string[],
): T[] => {
  if (!orderedIds?.length) {
    return columns;
  }

  const columnById = new Map(columns.map((col) => [col.id, col]));
  const ordered: T[] = [];

  for (const id of orderedIds) {
    const column = columnById.get(id);
    if (column) {
      ordered.push(column);
      columnById.delete(id);
    }
  }

  for (const column of columns) {
    if (columnById.has(column.id)) {
      ordered.push(column);
    }
  }

  return ordered;
};
