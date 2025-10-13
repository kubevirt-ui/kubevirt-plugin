import {
  findIndexForItem,
  insertItem,
  insertPositionedItems,
  isPositioned,
  itemDependsOnItem,
  orderExtensionBasedOnInsertBeforeAndAfter,
  toArray,
} from '../order-extensions';

type TestItem = {
  id: string;
  insertAfter?: string | string[];
  insertBefore?: string | string[];
  value?: any; // Additional property for testing
};

describe('order-extensions', () => {
  describe('toArray', () => {
    it('should return empty array for null/undefined values', () => {
      expect(toArray(null)).toEqual([]);
      expect(toArray(undefined)).toEqual([]);
      expect(toArray('')).toEqual([]);
      expect(toArray(0)).toEqual([]);
      expect(toArray(false)).toEqual([]);
    });

    it('should return the same array if input is already an array', () => {
      const input = ['a', 'b', 'c'];
      expect(toArray(input)).toEqual(input);
      expect(toArray(input)).toBe(input); // Should be the same reference
    });

    it('should convert single values to arrays', () => {
      expect(toArray('single')).toEqual(['single']);
      expect(toArray(123)).toEqual([123]);
      expect(toArray(true)).toEqual([true]);
      expect(toArray({ id: 'test' })).toEqual([{ id: 'test' }]);
    });
  });

  describe('itemDependsOnItem', () => {
    it('should return false when item has no constraints', () => {
      const item1: TestItem = { id: 'item1' };
      const item2: TestItem = { id: 'item2' };
      expect(itemDependsOnItem(item1, item2)).toBe(false);
    });

    it('should return true when item1 insertBefore includes item2.id', () => {
      const item1: TestItem = { id: 'item1', insertBefore: 'item2' };
      const item2: TestItem = { id: 'item2' };
      expect(itemDependsOnItem(item1, item2)).toBe(true);
    });

    it('should return true when item1 insertAfter includes item2.id', () => {
      const item1: TestItem = { id: 'item1', insertAfter: 'item2' };
      const item2: TestItem = { id: 'item2' };
      expect(itemDependsOnItem(item1, item2)).toBe(true);
    });

    it('should return true when item1 insertBefore array includes item2.id', () => {
      const item1: TestItem = { id: 'item1', insertBefore: ['item2', 'item3'] };
      const item2: TestItem = { id: 'item2' };
      expect(itemDependsOnItem(item1, item2)).toBe(true);
    });

    it('should return true when item1 insertAfter array includes item2.id', () => {
      const item1: TestItem = { id: 'item1', insertAfter: ['item2', 'item3'] };
      const item2: TestItem = { id: 'item2' };
      expect(itemDependsOnItem(item1, item2)).toBe(true);
    });

    it('should return false when constraints do not match', () => {
      const item1: TestItem = { id: 'item1', insertAfter: 'item4', insertBefore: 'item3' };
      const item2: TestItem = { id: 'item2' };
      expect(itemDependsOnItem(item1, item2)).toBe(false);
    });

    it('should handle both insertBefore and insertAfter constraints', () => {
      const item1: TestItem = { id: 'item1', insertAfter: 'item3', insertBefore: 'item2' };
      const item2: TestItem = { id: 'item2' };
      const item3: TestItem = { id: 'item3' };
      expect(itemDependsOnItem(item1, item2)).toBe(true);
      expect(itemDependsOnItem(item1, item3)).toBe(true);
    });
  });

  describe('isPositioned', () => {
    it('should return false when no other items depend on this item', () => {
      const items: TestItem[] = [{ id: 'item1' }, { id: 'item2' }, { id: 'item3' }];
      expect(isPositioned(items[0], items)).toBe(false);
    });

    it('should return true when it depends on another item', () => {
      const items: TestItem[] = [{ id: 'item1', insertAfter: 'item2' }, { id: 'item2' }];
      expect(isPositioned(items[0], items)).toBe(true);
    });

    it('should return false for the item that has constraints but such item does not exit', () => {
      const items: TestItem[] = [{ id: 'item1' }, { id: 'item2', insertAfter: 'item3' }];
      expect(isPositioned(items[1], items)).toBe(false);
    });

    it('should handle complex dependency scenarios', () => {
      const items: TestItem[] = [
        { id: 'item1' },
        { id: 'item2', insertAfter: 'item1' },
        { id: 'item3', insertBefore: 'item2' },
      ];
      expect(isPositioned(items[0], items)).toBe(false); // no positioning
      expect(isPositioned(items[1], items)).toBe(true); // item2 is positioned after item1
      expect(isPositioned(items[2], items)).toBe(true); // item3 is positioned before item2
    });
  });

  describe('findIndexForItem', () => {
    it('should return -1 when item has no constraints', () => {
      const item: TestItem = { id: 'item1' };
      const currentItems: TestItem[] = [{ id: 'item2' }, { id: 'item3' }];
      expect(findIndexForItem(item, currentItems)).toBe(-1);
    });

    it('should return correct index for insertBefore constraint', () => {
      const item: TestItem = { id: 'newItem', insertBefore: 'item2' };
      const currentItems: TestItem[] = [{ id: 'item1' }, { id: 'item2' }, { id: 'item3' }];
      expect(findIndexForItem(item, currentItems)).toBe(1); // Should insert at index 1, before item2
    });

    it('should return correct index for insertAfter constraint', () => {
      const item: TestItem = { id: 'newItem', insertAfter: 'item2' };
      const currentItems: TestItem[] = [{ id: 'item1' }, { id: 'item2' }, { id: 'item3' }];
      expect(findIndexForItem(item, currentItems)).toBe(2); // Should insert at index 2, after item2
    });

    it('should prioritize insertBefore over insertAfter', () => {
      const item: TestItem = { id: 'newItem', insertAfter: 'item2', insertBefore: 'item2' };
      const currentItems: TestItem[] = [{ id: 'item1' }, { id: 'item2' }, { id: 'item3' }];
      expect(findIndexForItem(item, currentItems)).toBe(1); // Should use insertBefore (index 1)
    });

    it('should handle array constraints for insertBefore and use first found', () => {
      const item: TestItem = { id: 'newItem', insertBefore: ['nonExistent', 'item2'] };
      const currentItems: TestItem[] = [{ id: 'item1' }, { id: 'item2' }, { id: 'item3' }];
      expect(findIndexForItem(item, currentItems)).toBe(1); // Should find item2 and insert before it
    });

    it('should handle array constraints for insertAfter and use first found', () => {
      const item: TestItem = { id: 'newItem', insertAfter: ['item2', 'item3'] };
      const currentItems: TestItem[] = [{ id: 'item1' }, { id: 'item2' }, { id: 'item3' }];
      expect(findIndexForItem(item, currentItems)).toBe(2); // Should find item2 and insert after it
    });

    it('should return -1 when constraint references do not exist', () => {
      const item: TestItem = {
        id: 'newItem',
        insertAfter: 'nonExistent',
        insertBefore: 'nonExistent',
      };
      const currentItems: TestItem[] = [{ id: 'item1' }, { id: 'item2' }];
      expect(findIndexForItem(item, currentItems)).toBe(-1);
    });
  });

  describe('insertItem', () => {
    it('should append item when findIndexForItem returns -1', () => {
      const item: TestItem = { id: 'newItem' };
      const currentItems: TestItem[] = [{ id: 'item1' }, { id: 'item2' }];
      insertItem(item, currentItems);
      expect(currentItems.map(({ id }) => id)).toEqual(['item1', 'item2', 'newItem']);
    });

    it('should insert item at correct position for insertBefore', () => {
      const item: TestItem = { id: 'newItem', insertBefore: 'item2' };
      const currentItems: TestItem[] = [{ id: 'item1' }, { id: 'item2' }, { id: 'item3' }];
      insertItem(item, currentItems);
      expect(currentItems.map(({ id }) => id)).toEqual(['item1', 'newItem', 'item2', 'item3']);
    });

    it('should insert item at correct position for insertAfter', () => {
      const item: TestItem = { id: 'newItem', insertAfter: 'item1' };
      const currentItems: TestItem[] = [{ id: 'item1' }, { id: 'item2' }];
      insertItem(item, currentItems);
      expect(currentItems.map(({ id }) => id)).toEqual(['item1', 'newItem', 'item2']);
    });

    it('should insert at index 0 when insertBefore references first item', () => {
      const item: TestItem = { id: 'newItem', insertBefore: 'item1' };
      const currentItems: TestItem[] = [{ id: 'item1' }, { id: 'item2' }];
      insertItem(item, currentItems);
      expect(currentItems.map(({ id }) => id)).toEqual(['newItem', 'item1', 'item2']);
    });
  });

  describe('insertPositionedItems', () => {
    it('should return early when insertItems is empty', () => {
      const currentItems: TestItem[] = [{ id: 'item1' }];
      const originalLength = currentItems.length;
      insertPositionedItems([], currentItems);
      expect(currentItems).toHaveLength(originalLength);
    });

    it('should handle simple non-circular positioning', () => {
      const insertItems: TestItem[] = [{ id: 'item2', insertAfter: 'item1' }];
      const currentItems: TestItem[] = [{ id: 'item1' }, { id: 'item3' }];
      insertPositionedItems(insertItems, currentItems);
      expect(currentItems.map(({ id }) => id)).toEqual(['item1', 'item2', 'item3']);
    });

    it('should handle circular dependencies by inserting all items one by one', () => {
      const insertItems: TestItem[] = [
        { id: 'item1', insertAfter: 'item2' },
        { id: 'item2', insertBefore: 'item1' },
      ];
      const currentItems: TestItem[] = [];
      insertPositionedItems(insertItems, currentItems);
      expect(currentItems.map(({ id }) => id)).toEqual(['item2', 'item1']);
    });

    it('should handle positioning relative to items that are also positioned ', () => {
      const insertItems: TestItem[] = [
        { id: 'item2', insertBefore: 'item1' },
        { id: 'item3', insertAfter: 'item2' },
      ];
      const currentItems: TestItem[] = [{ id: 'item1' }];
      insertPositionedItems(insertItems, currentItems);
      expect(currentItems.map(({ id }) => id)).toEqual(['item2', 'item3', 'item1']);
    });

    it('should handle mixed positioned and non-positioned items in insertItems', () => {
      const insertItems: TestItem[] = [
        { id: 'free1' }, // No positioning constraints
        { id: 'positioned1', insertAfter: 'item1' },
        { id: 'free2' }, // No positioning constraints
      ];
      const currentItems: TestItem[] = [{ id: 'item1' }];
      insertPositionedItems(insertItems, currentItems);
      expect(currentItems.map(({ id }) => id)).toEqual(['item1', 'positioned1', 'free1', 'free2']);
    });
  });

  describe('orderExtensionBasedOnInsertBeforeAndAfter', () => {
    it('should return empty array for null/undefined/empty input', () => {
      expect(orderExtensionBasedOnInsertBeforeAndAfter(null)).toEqual([]);
      expect(orderExtensionBasedOnInsertBeforeAndAfter(undefined)).toEqual([]);
      expect(orderExtensionBasedOnInsertBeforeAndAfter([])).toEqual([]);
    });

    it('should preserve order when no positioning constraints exist', () => {
      const items: TestItem[] = [{ id: 'item1' }, { id: 'item2' }, { id: 'item3' }];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(items);
      expect(result).toEqual(items);
    });

    it('should handle single item with no constraints', () => {
      const items: TestItem[] = [{ id: 'item1' }];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(items);
      expect(result).toEqual(items);
    });

    it('should order items with insertAfter constraints', () => {
      const items: TestItem[] = [
        { id: 'item1' },
        { id: 'item2', insertAfter: 'item1' },
        { id: 'item3', insertAfter: 'item2' },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(items);
      expect(result.map((item) => item.id)).toEqual(['item1', 'item2', 'item3']);
    });

    it('should order items with insertBefore constraints', () => {
      const items: TestItem[] = [
        { id: 'item3' },
        { id: 'item2', insertBefore: 'item3' },
        { id: 'item1', insertBefore: 'item2' },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(items);
      expect(result.map((item) => item.id)).toEqual(['item1', 'item2', 'item3']);
    });

    it('should handle mixed insertBefore and insertAfter constraints', () => {
      const items: TestItem[] = [
        { id: 'middle' },
        { id: 'first', insertBefore: 'middle' },
        { id: 'last', insertAfter: 'middle' },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(items);
      expect(result.map((item) => item.id)).toEqual(['first', 'middle', 'last']);
    });

    it('should handle array of constraints in insertBefore', () => {
      const items: TestItem[] = [
        { id: 'item1' },
        { id: 'item2' },
        { id: 'item3', insertBefore: ['item1', 'item2'] },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(items);
      expect(result.map((item) => item.id)).toEqual(['item3', 'item1', 'item2']);
    });

    it('should handle array of constraints in insertAfter', () => {
      const items: TestItem[] = [
        { id: 'item1' },
        { id: 'item2' },
        { id: 'item3', insertAfter: ['item1', 'item2'] },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(items);
      expect(result.map((item) => item.id)).toEqual(['item1', 'item3', 'item2']);
    });

    it('should handle complex dependency chains', () => {
      const items: TestItem[] = [
        { id: 'item4', insertAfter: 'item3' },
        { id: 'item2', insertAfter: 'item1' },
        { id: 'item1' },
        { id: 'item3', insertAfter: 'item2' },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(items);
      expect(result.map((item) => item.id)).toEqual(['item1', 'item2', 'item3', 'item4']);
    });

    it('should handle 2 items cycle with insertAfter', () => {
      const items: TestItem[] = [
        { id: 'item1', insertAfter: 'item2' },
        { id: 'item2', insertAfter: 'item1' },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(items);
      expect(result.map((item) => item.id)).toEqual(['item1', 'item2']);
    });

    it('should handle 3 items cycle with insertAfter', () => {
      const items: TestItem[] = [
        { id: 'item1', insertAfter: 'item3' },
        { id: 'item2', insertAfter: 'item1' },
        { id: 'item3', insertAfter: 'item2' },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(items);
      expect(result.map((item) => item.id)).toEqual(['item1', 'item2', 'item3']);
    });

    it('should handle 2 items cycle with insertBefore', () => {
      const circularBefore: TestItem[] = [
        { id: 'X', insertBefore: 'Y' },
        { id: 'Y', insertBefore: 'X' },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(circularBefore);
      expect(result.map((item) => item.id)).toEqual(['Y', 'X']);
    });

    it('should handle 4 items mixed cycle', () => {
      const mixedCircular: TestItem[] = [
        { id: 'K', insertAfter: 'M' },
        { id: 'L' },
        { id: 'M', insertAfter: 'K' },
        { id: 'N', insertBefore: 'M' },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(mixedCircular);
      expect(result.map((item) => item.id)).toEqual(['L', 'K', 'N', 'M']);
    });

    it('should handle 4 items mixed cycle with bad initial ordering', () => {
      const complexCircular: TestItem[] = [
        { id: 'P', insertAfter: 'S' },
        { id: 'S', insertAfter: 'R' },
        { id: 'R', insertAfter: 'Q' },
        { id: 'Q', insertAfter: 'P' },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(complexCircular);
      expect(result.map((item) => item.id)).toEqual(['P', 'Q', 'S', 'R']);
    });

    it('should handle 4 items mixed cycle with good initial ordering', () => {
      const complexCircular: TestItem[] = [
        { id: 'P', insertAfter: 'S' },
        { id: 'Q', insertAfter: 'P' },
        { id: 'R', insertAfter: 'Q' },
        { id: 'S', insertAfter: 'R' },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(complexCircular);
      expect(result.map((item) => item.id)).toEqual(['P', 'Q', 'R', 'S']);
    });

    it('should handle both insertBefore and insertAfter on same item', () => {
      const items: TestItem[] = [
        { id: 'item1' },
        { id: 'item3' },
        { id: 'item2', insertAfter: 'item1', insertBefore: 'item3' },
      ];
      const result = orderExtensionBasedOnInsertBeforeAndAfter(items);
      expect(result.map((item) => item.id)).toEqual(['item1', 'item2', 'item3']);
    });
  });
});
