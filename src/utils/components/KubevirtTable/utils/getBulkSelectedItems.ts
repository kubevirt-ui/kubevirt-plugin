import { BulkSelectValue } from '@patternfly/react-component-groups/dist/dynamic/BulkSelect';

export type GetItemId<T> = (item: T, index: number) => string;

export type GetBulkSelectedItemsArgs<T> = {
  allItems: T[];
  currentPageItems: T[];
  getItemId: GetItemId<T>;
  selectedItems: T[];
  value: BulkSelectValue;
};

export const addItemsToSelection = <T>(
  selectedItems: T[],
  itemsToAdd: T[],
  getItemId: GetItemId<T>,
): T[] => {
  const existingIds = new Set(selectedItems.map((item, index) => getItemId(item, index)));
  const newItems = itemsToAdd.filter((item, index) => !existingIds.has(getItemId(item, index)));

  return [...selectedItems, ...newItems];
};

export const removeItemsFromSelection = <T>(
  selectedItems: T[],
  itemsToRemove: T[],
  getItemId: GetItemId<T>,
): T[] => {
  const idsToRemove = new Set(itemsToRemove.map((item, index) => getItemId(item, index)));

  return selectedItems.filter((item, index) => !idsToRemove.has(getItemId(item, index)));
};

export const getBulkSelectedItems = <T>({
  allItems,
  currentPageItems,
  getItemId,
  selectedItems,
  value,
}: GetBulkSelectedItemsArgs<T>): T[] => {
  switch (value) {
    case BulkSelectValue.none:
      return [];
    case BulkSelectValue.nonePage:
      return removeItemsFromSelection(selectedItems, currentPageItems, getItemId);
    case BulkSelectValue.page:
      return addItemsToSelection(selectedItems, currentPageItems, getItemId);
    case BulkSelectValue.all:
      return allItems;
    default:
      return selectedItems;
  }
};
