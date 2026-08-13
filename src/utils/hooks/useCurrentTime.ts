import { useEffect, useState } from 'react';

const DEFAULT_REFRESH_INTERVAL_MS = 30_000;
const MIN_REFRESH_INTERVAL_MS = 1_000;

const useCurrentTime = (refreshInterval = DEFAULT_REFRESH_INTERVAL_MS): number => {
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  const safeInterval = Math.max(
    MIN_REFRESH_INTERVAL_MS,
    refreshInterval || DEFAULT_REFRESH_INTERVAL_MS,
  );

  useEffect(() => {
    const intervalId = setInterval(() => setCurrentTime(Date.now()), safeInterval);
    return (): void => clearInterval(intervalId);
  }, [safeInterval]);

  return currentTime;
};

export default useCurrentTime;
