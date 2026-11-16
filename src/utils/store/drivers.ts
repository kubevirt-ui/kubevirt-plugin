import type { VirtioWinDriversInfo } from '@kubevirt-utils/resources/vm/utils/disk/drivers';

type DriverCacheEntry = VirtioWinDriversInfo & { loading: boolean };

let driverCache: ReadonlyMap<string, DriverCacheEntry> = new Map();

const listeners = new Set<() => void>();

const CACHE_KEY_DEFAULT = '';

const getCacheKey = (cluster: string | undefined): string => cluster ?? CACHE_KEY_DEFAULT;

const notifyListeners = (): void => {
  listeners.forEach((listener) => listener());
};

export const subscribeDriverCache = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getDriverEntry = (cluster: string | undefined): DriverCacheEntry | undefined =>
  driverCache.get(getCacheKey(cluster));

export const setDriverEntry = (cluster: string | undefined, entry: DriverCacheEntry): void => {
  driverCache = new Map(driverCache).set(getCacheKey(cluster), entry);
  notifyListeners();
};
