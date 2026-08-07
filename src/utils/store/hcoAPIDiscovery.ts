import { signal } from '@preact/signals-react';

export type HCOAPIDiscoveryEntry = {
  loading: boolean;
  preferredVersion: string | undefined;
};

export const hcoAPIDiscoveryCache = signal<ReadonlyMap<string, HCOAPIDiscoveryEntry>>(new Map());

export const getHCOAPIDiscoveryEntry = (cluster: string): HCOAPIDiscoveryEntry | undefined =>
  hcoAPIDiscoveryCache.value.get(cluster);

export const setHCOAPIDiscoveryEntry = (cluster: string, entry: HCOAPIDiscoveryEntry): void => {
  hcoAPIDiscoveryCache.value = new Map(hcoAPIDiscoveryCache.value).set(cluster, entry);
};

export const clearHCOAPIDiscoveryCache = (): void => {
  hcoAPIDiscoveryCache.value = new Map();
};
