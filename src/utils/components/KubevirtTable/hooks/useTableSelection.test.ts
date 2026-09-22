import { renderHook } from '@testing-library/react';

import { useTableSelection } from './useTableSelection';

type Item = { id: string };

const getRowId = (item: Item): string => item.id;

describe('useTableSelection', () => {
  it('should keep the same item selected after the list is reordered', () => {
    const a = { id: 'a' };
    const b = { id: 'b' };
    const c = { id: 'c' };
    const onSelect = jest.fn();

    const { rerender, result } = renderHook(
      ({ data }: { data: Item[] }) =>
        useTableSelection({
          data,
          getRowId,
          onSelect,
          paginatedData: data,
          selectedItems: [b],
        }),
      { initialProps: { data: [a, b, c] } },
    );

    expect(result.current.isRowSelected(b)).toBe(true);
    expect(result.current.isRowSelected(a)).toBe(false);

    rerender({ data: [c, a, b] });

    expect(result.current.isRowSelected(b)).toBe(true);
    expect(result.current.isRowSelected(c)).toBe(false);
    expect(result.current.isRowSelected(a)).toBe(false);
  });
});
