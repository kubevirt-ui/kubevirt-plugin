import { renderHook } from '@testing-library/react';

import useQueuedUserSettingWrite from './useQueuedUserSettingWrite';

describe('useQueuedUserSettingWrite', () => {
  it('returns a stable writer function that queues writes', async () => {
    const writeOrder: number[] = [];
    const { rerender, result } = renderHook(() => useQueuedUserSettingWrite());

    const firstRef = result.current;

    await result.current(1, async () => {
      writeOrder.push(1);
    });
    rerender();
    await result.current(2, async () => {
      writeOrder.push(2);
    });

    expect(result.current).toBe(firstRef);

    expect(writeOrder).toEqual([1, 2]);
  });
});
