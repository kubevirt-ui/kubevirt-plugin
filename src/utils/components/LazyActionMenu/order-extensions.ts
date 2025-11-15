import partition from 'lodash/partition';

type ItemsToSort = {
  id: string;
  insertAfter?: string | string[];
  insertBefore?: string | string[];
};

export const toArray = <T>(value: T | T[]): T[] => {
  if (value) {
    return Array.isArray(value) ? value : [value];
  }
  return [];
};

export const itemDependsOnItem = <T extends ItemsToSort>(item: T, other: T): boolean => {
  if (!item.insertBefore && !item.insertAfter) {
    return false;
  }
  const before = toArray(item.insertBefore);
  const after = toArray(item.insertAfter);
  return before.includes(other.id) || after.includes(other.id);
};

export const isPositioned = <T extends ItemsToSort>(item: T, allItems: T[]): boolean =>
  !!allItems.find((other) => itemDependsOnItem<T>(item, other));

export const findIndexForItem = <T extends ItemsToSort>(item: T, currentItems: T[]): number => {
  const { insertAfter, insertBefore } = item;
  const beforeIds = toArray(insertBefore);
  const afterIds = toArray(insertAfter);

  for (const id of beforeIds) {
    const index = currentItems.findIndex((other) => other.id === id);
    if (index >= 0) {
      return index;
    }
  }

  for (const id of afterIds) {
    const index = currentItems.findIndex((other) => other.id === id);
    if (index >= 0) {
      return index + 1;
    }
  }

  return -1;
};

export const insertItem = <T extends ItemsToSort>(item: T, currentItems: T[]): void => {
  const index = findIndexForItem<T>(item, currentItems);
  if (index >= 0) {
    currentItems.splice(index, 0, item);
  } else {
    currentItems.push(item);
  }
};

export const insertPositionedItems = <T extends ItemsToSort>(
  insertItems: T[],
  currentItems: T[],
): void => {
  if (insertItems.length === 0) {
    return;
  }

  const [positionedItems, sortedItems] = partition(insertItems, (item) =>
    isPositioned<T>(item, insertItems),
  );

  if (sortedItems.length === 0) {
    // Circular dependencies
    positionedItems.forEach((i) => insertItem<T>(i, currentItems));
    return;
  }

  sortedItems.forEach((i) => insertItem<T>(i, currentItems));
  insertPositionedItems<T>(positionedItems, currentItems);
};

export const orderExtensionBasedOnInsertBeforeAndAfter = <T extends ItemsToSort>(
  items: T[],
): T[] => {
  if (!items || !items.length) {
    return [];
  }
  const [positionedItems, sortedItems] = partition(items, (item) => isPositioned<T>(item, items));
  insertPositionedItems<T>(positionedItems, sortedItems);
  return sortedItems;
};
