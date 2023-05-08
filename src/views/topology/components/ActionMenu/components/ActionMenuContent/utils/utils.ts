import {
  GroupedMenuOption,
  MenuOption,
  MenuOptionType,
} from '@openshift-console/dynamic-plugin-sdk';

interface ItemsToSort {
  id: string;
  insertBefore?: string | string[];
  insertAfter?: string | string[];
}

const itemDependsOnItem = <T extends ItemsToSort>(s1: T, s2: T): boolean => {
  if (!s1.insertBefore && !s1.insertAfter) {
    return false;
  }
  const before = Array.from(s1.insertBefore) || [];
  const after = Array.from(s1.insertAfter) || [];
  return before.includes(s2.id) || after.includes(s2.id);
};

const isPositioned = <T extends ItemsToSort>(item: T, allItems: T[]): boolean =>
  !!allItems.find((i) => itemDependsOnItem<T>(item, i));

const findIndexForItem = <T extends ItemsToSort>(item: T, currentItems: T[]): number => {
  const { insertBefore, insertAfter } = item;
  let index = -1;
  const before = Array.from(insertBefore) || [];
  const after = Array.from(insertAfter) || [];
  let count = 0;
  while (count < before.length && index < 0) {
    // eslint-disable-next-line no-loop-func
    index = currentItems.findIndex((i) => i.id === before[count]);
    count++;
  }
  count = 0;
  while (count < after.length && index < 0) {
    // eslint-disable-next-line no-loop-func
    index = currentItems.findIndex((i) => i.id === after[count]);
    if (index >= 0) {
      index += 1;
    }
    count++;
  }
  return index;
};

const insertItem = <T extends ItemsToSort>(item: T, currentItems: T[]): void => {
  const index = findIndexForItem<T>(item, currentItems);
  if (index >= 0) {
    currentItems.splice(index, 0, item);
  } else {
    currentItems.push(item);
  }
};

const insertPositionedItems = <T extends ItemsToSort>(
  insertItems: T[],
  currentItems: T[],
): void => {
  if (insertItems.length === 0) {
    return;
  }

  const sortedItems = insertItems.filter((item) => !isPositioned<T>(item, insertItems));
  const positionedItems = insertItems.filter((item) => isPositioned<T>(item, insertItems));

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
  const sortedItems = items.filter((item) => !isPositioned<T>(item, items));
  const positionedItems = items.filter((item) => isPositioned<T>(item, items));
  insertPositionedItems<T>(positionedItems, sortedItems);
  return sortedItems;
};

export const getMenuOptionType = (option: MenuOption) => {
  // a grouped menu has children
  const isGroupMenu = Array.isArray((option as GroupedMenuOption).children);
  // a submenu menu has children and submenu property true
  const isSubMenu = isGroupMenu && (option as GroupedMenuOption).submenu;

  if (isSubMenu) {
    return MenuOptionType.SUB_MENU;
  }

  if (isGroupMenu) {
    return MenuOptionType.GROUP_MENU;
  }

  return MenuOptionType.ATOMIC_MENU;
};
