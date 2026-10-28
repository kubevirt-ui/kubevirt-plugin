import type { ManagedColumn } from '@openshift-console/dynamic-plugin-sdk';

export const getHiddenSelectedColumnIds = (
  selectedColumns: Set<string> | undefined,
  manageableColumns: ManagedColumn[],
): string[] => {
  const manageableIds = new Set(manageableColumns.map((column) => column.id));
  return Array.from(selectedColumns ?? []).filter((id) => !manageableIds.has(id));
};

export const getInitialCheckedManageableColumnIds = (
  selectedColumns: Set<string> | undefined,
  manageableColumns: ManagedColumn[],
  defaultColumnIds: string[],
): string[] => {
  const manageableIds = new Set(manageableColumns.map((column) => column.id));

  if (selectedColumns?.size) {
    return Array.from(selectedColumns).filter((id) => manageableIds.has(id));
  }

  return defaultColumnIds.filter((id) => manageableIds.has(id));
};

/** All manageable columns in list order: active columns first (saved order), then the rest. */
export const getInitialOrderedAllColumnIds = (
  manageableColumns: ManagedColumn[],
  selectedColumns: Set<string> | undefined,
  defaultColumnIds: string[],
): string[] => {
  const allIds = manageableColumns.map((column) => column.id).filter(Boolean);
  const checkedOrdered = getInitialCheckedManageableColumnIds(
    selectedColumns,
    manageableColumns,
    defaultColumnIds,
  );
  const unchecked = allIds.filter((id) => !checkedOrdered.includes(id));
  return [...checkedOrdered, ...unchecked];
};

export const getOrderedCheckedColumnIds = (
  orderedAllColumnIds: string[],
  checkedColumnIds: Set<string>,
): string[] => orderedAllColumnIds.filter((id) => checkedColumnIds.has(id));

export const mergeColumnIdsForSave = (
  hiddenSelectedColumnIds: string[],
  orderedCheckedManageableColumnIds: string[],
): string[] => [...hiddenSelectedColumnIds, ...orderedCheckedManageableColumnIds];
