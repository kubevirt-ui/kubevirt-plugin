import { useState } from 'react';

/**
 * Tracks the running maximum of a chart's Y value across renders.
 * Only allows upward changes to prevent Y-axis jitter from fluctuating data.
 * Resets when resetKey changes (e.g. duration or VM identity change).
 */
const useStableYMax = (currentMax: null | number, resetKey?: unknown): null | number => {
  const [stableMax, setStableMax] = useState<null | number>(null);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  if (prevResetKey !== resetKey) {
    setStableMax(null);
    setPrevResetKey(resetKey);
  }

  if (
    currentMax !== null &&
    Number.isFinite(currentMax) &&
    (stableMax === null || currentMax > stableMax)
  ) {
    setStableMax(currentMax);
  }

  return stableMax;
};

export default useStableYMax;
