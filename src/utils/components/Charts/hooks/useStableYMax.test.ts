import { renderHook } from '@testing-library/react';

import useStableYMax from './useStableYMax';

describe('useStableYMax', () => {
  it('should return null when currentMax is null', () => {
    const { result } = renderHook(() => useStableYMax(null));
    expect(result.current).toBeNull();
  });

  it('should return the currentMax on first non-null value', () => {
    const { result } = renderHook(() => useStableYMax(100));
    expect(result.current).toBe(100);
  });

  it('should track the running maximum across re-renders', () => {
    let currentMax = 50;
    const { rerender, result } = renderHook(() => useStableYMax(currentMax));

    expect(result.current).toBe(50);

    currentMax = 200;
    rerender();
    expect(result.current).toBe(200);

    currentMax = 100;
    rerender();
    expect(result.current).toBe(200);

    currentMax = 250;
    rerender();
    expect(result.current).toBe(250);

    currentMax = 50;
    rerender();
    expect(result.current).toBe(250);
  });

  describe('resetKey', () => {
    it('should reset the stable max when resetKey changes', () => {
      let currentMax = 200;
      let resetKey = '5m';
      const { rerender, result } = renderHook(() => useStableYMax(currentMax, resetKey));

      expect(result.current).toBe(200);

      currentMax = 80;
      resetKey = '1h';
      rerender();
      expect(result.current).toBe(80);
    });

    it('should not reset when resetKey stays the same', () => {
      let currentMax = 200;
      const resetKey = '5m';
      const { rerender, result } = renderHook(() => useStableYMax(currentMax, resetKey));

      expect(result.current).toBe(200);

      currentMax = 100;
      rerender();
      expect(result.current).toBe(200);
    });

    it('should accumulate a new maximum after reset', () => {
      let currentMax = 200;
      let resetKey = '5m';
      const { rerender, result } = renderHook(() => useStableYMax(currentMax, resetKey));

      expect(result.current).toBe(200);

      currentMax = 50;
      resetKey = '1h';
      rerender();
      expect(result.current).toBe(50);

      currentMax = 120;
      rerender();
      expect(result.current).toBe(120);

      currentMax = 80;
      rerender();
      expect(result.current).toBe(120);
    });
  });

  describe('edge cases', () => {
    it('should handle zero as a valid currentMax', () => {
      const { result } = renderHook(() => useStableYMax(0));
      expect(result.current).toBe(0);
    });

    it('should handle transition from null to a value', () => {
      let currentMax: null | number = null;
      const { rerender, result } = renderHook(() => useStableYMax(currentMax));

      expect(result.current).toBeNull();

      currentMax = 100;
      rerender();
      expect(result.current).toBe(100);
    });

    it('should ignore null after receiving a value', () => {
      let currentMax: null | number = 100;
      const { rerender, result } = renderHook(() => useStableYMax(currentMax));

      expect(result.current).toBe(100);

      currentMax = null;
      rerender();
      expect(result.current).toBe(100);
    });

    it('should ignore -Infinity', () => {
      const { result } = renderHook(() => useStableYMax(-Infinity));
      expect(result.current).toBeNull();
    });

    it('should ignore NaN', () => {
      const { result } = renderHook(() => useStableYMax(NaN));
      expect(result.current).toBeNull();
    });

    it('should not replace a finite max with -Infinity', () => {
      let currentMax: number = 200;
      const { rerender, result } = renderHook(() => useStableYMax(currentMax));

      expect(result.current).toBe(200);

      currentMax = -Infinity;
      rerender();
      expect(result.current).toBe(200);
    });

    it('should ignore +Infinity', () => {
      const { result } = renderHook(() => useStableYMax(Infinity));
      expect(result.current).toBeNull();
    });

    it('should not replace a finite max with +Infinity', () => {
      let currentMax: number = 200;
      const { rerender, result } = renderHook(() => useStableYMax(currentMax));

      expect(result.current).toBe(200);

      currentMax = Infinity;
      rerender();
      expect(result.current).toBe(200);
    });
  });
});
