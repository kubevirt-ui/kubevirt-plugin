import { BulkSelectValue } from '@patternfly/react-component-groups/dist/dynamic/BulkSelect';

import { getBulkSelectedItems } from './getBulkSelectedItems';

type Item = {
  id: string;
  label: string;
};

const getItemId = (item: Item): string => item.id;

const page1: Item[] = [
  { id: 'a', label: 'page-1-a' },
  { id: 'b', label: 'page-1-b' },
];
const page2: Item[] = [
  { id: 'c', label: 'page-2-c' },
  { id: 'd', label: 'page-2-d' },
];
const allItems: Item[] = [...page1, ...page2];

describe('getBulkSelectedItems', () => {
  describe('when selecting a page', () => {
    it('should merge current page items with the existing selection', () => {
      const result = getBulkSelectedItems({
        allItems,
        currentPageItems: page2,
        getItemId,
        selectedItems: page1,
        value: BulkSelectValue.page,
      });

      expect(result.map(getItemId)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should equal the current page when nothing is selected', () => {
      const result = getBulkSelectedItems({
        allItems,
        currentPageItems: page2,
        getItemId,
        selectedItems: [],
        value: BulkSelectValue.page,
      });

      expect(result).toEqual(page2);
    });

    it('should not duplicate items already selected on the current page', () => {
      const result = getBulkSelectedItems({
        allItems,
        currentPageItems: page1,
        getItemId,
        selectedItems: [page1[0], page2[0]],
        value: BulkSelectValue.page,
      });

      expect(result.map(getItemId)).toEqual(['a', 'c', 'b']);
    });

    it('should identify items by id rather than object reference', () => {
      const selectedFromOtherRender: Item[] = [
        { id: 'a', label: 'stale-a' },
        { id: 'b', label: 'stale-b' },
      ];

      const result = getBulkSelectedItems({
        allItems,
        currentPageItems: page2,
        getItemId,
        selectedItems: selectedFromOtherRender,
        value: BulkSelectValue.page,
      });

      expect(result).toEqual([...selectedFromOtherRender, ...page2]);
    });
  });

  describe('when deselecting a page', () => {
    it('should remove only current page items from the selection', () => {
      const result = getBulkSelectedItems({
        allItems,
        currentPageItems: page2,
        getItemId,
        selectedItems: allItems,
        value: BulkSelectValue.nonePage,
      });

      expect(result).toEqual(page1);
    });

    it('should identify items by id rather than object reference', () => {
      const selectedFromOtherRender: Item[] = [
        { id: 'a', label: 'stale-a' },
        { id: 'c', label: 'stale-c' },
      ];

      const result = getBulkSelectedItems({
        allItems,
        currentPageItems: page2,
        getItemId,
        selectedItems: selectedFromOtherRender,
        value: BulkSelectValue.nonePage,
      });

      expect(result).toEqual([{ id: 'a', label: 'stale-a' }]);
    });
  });

  describe('when selecting none', () => {
    it('should clear the entire selection', () => {
      const result = getBulkSelectedItems({
        allItems,
        currentPageItems: page1,
        getItemId,
        selectedItems: allItems,
        value: BulkSelectValue.none,
      });

      expect(result).toEqual([]);
    });
  });

  describe('when selecting all', () => {
    it('should return the full filtered set', () => {
      const result = getBulkSelectedItems({
        allItems,
        currentPageItems: page1,
        getItemId,
        selectedItems: page1,
        value: BulkSelectValue.all,
      });

      expect(result).toBe(allItems);
    });
  });
});
