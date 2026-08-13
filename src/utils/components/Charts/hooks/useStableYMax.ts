import { useState } from 'react';

type StableYMaxState = {
  prevResetKey: unknown;
  stableMax: null | number;
};

/**
 * Tracks the running maximum of a chart's Y value across renders.
 * Only allows upward changes to prevent Y-axis jitter from fluctuating data.
 * Resets when resetKey changes (e.g. duration or VM identity change).
 * @param currentMax
 * @param resetKey
 */
const useStableYMax = (currentMax: null | number, resetKey?: unknown): null | number => {
  const [state, setState] = useState<StableYMaxState>({
    prevResetKey: resetKey,
    stableMax: null,
  });

  let { stableMax } = state;

  if (state.prevResetKey !== resetKey) {
    stableMax = null;
    setState({ prevResetKey: resetKey, stableMax: null });
  }

  if (
    currentMax !== null &&
    Number.isFinite(currentMax) &&
    (stableMax === null || currentMax > stableMax)
  ) {
    const nextMax = currentMax;
    setState((prev) => ({
      ...prev,
      stableMax: nextMax,
    }));
    return nextMax;
  }

  return stableMax;
};

export default useStableYMax;
