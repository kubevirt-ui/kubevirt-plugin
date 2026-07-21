import type { VirtioWinDriversInfo } from '@kubevirt-utils/resources/vm/utils/disk/drivers';
import { signal } from '@preact/signals-react';

type DriverCacheEntry = VirtioWinDriversInfo & { loading: boolean };

export const driverCache = signal<ReadonlyMap<string, DriverCacheEntry>>(new Map());

const CACHE_KEY_DEFAULT = '';

export const getCacheKey = (cluster: string | undefined): string => cluster ?? CACHE_KEY_DEFAULT;

export const getDriverEntry = (cluster: string | undefined): DriverCacheEntry | undefined =>
  driverCache.value.get(getCacheKey(cluster));

export const setDriverEntry = (cluster: string | undefined, entry: DriverCacheEntry): void => {
  driverCache.value = new Map(driverCache.value).set(getCacheKey(cluster), entry);
};
