import { type HelperOptions } from '@kubevirt-utils/hooks/useKubevirtToast/types';
import { type FleetWatchK8sResource } from '@stolostron/multicluster-sdk';

export type WatchedResourceEntry = {
  toastOptions: HelperOptions;
  watchDataResource: FleetWatchK8sResource | undefined;
};

export type WatchedResourcesStoreSliceData = Record<string, WatchedResourceEntry>;

export enum WatchedResourceKeyPrefix {
  CloneVm = 'clone-vm',
}

export type WatchedResourcesSliceActions = {
  pushNewWatchedResource: (
    watchedResourceEntry: WatchedResourceEntry,
    keyPrefix: WatchedResourceKeyPrefix,
  ) => void;
  removeWatchedResource: (id: string) => void;
};

export type WatchedResourcesStoreSlice = {
  actions: WatchedResourcesSliceActions;
  data: WatchedResourcesStoreSliceData;
};

export type WatchedResourceToast = WatchedResourceEntry & {
  id: string;
};
