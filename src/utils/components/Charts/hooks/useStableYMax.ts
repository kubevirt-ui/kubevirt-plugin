import { useRef } from 'react';

/**
 * Tracks the running maximum of a chart's Y value across renders.
 * Only allows upward changes to prevent Y-axis jitter from fluctuating data.
 * Resets when resetKey changes (e.g. duration or VM identity change).
 * @param currentMax
 * @param resetKey
 */
const useStableYMax = (currentMax: null | number, resetKey?: unknown): null | number => {
  const stableMax = useRef<null | number>(null);
  const prevResetKey = useRef(resetKey);

  if (prevResetKey.current !== resetKey) {
    stableMax.current = null;
    prevResetKey.current = resetKey;
  }

  if (
    currentMax !== null &&
    Number.isFinite(currentMax) &&
    (stableMax.current === null || currentMax > stableMax.current)
  ) {
    stableMax.current = currentMax;
  }

  return stableMax.current;
};

export default useStableYMax;
