import { type UploadSuccessLink } from '@kubevirt-utils/hooks/useInFlightToast/shared/types/types';
import { type HelperOptions } from '@kubevirt-utils/hooks/useKubevirtToast/types';
import { type FleetWatchK8sResource } from '@stolostron/multicluster-sdk';

export type WatchedResourceToastOptions = HelperOptions & {
  error?: unknown;
  showInitialToast?: boolean;
  successContent?: string;
  successLinks?: UploadSuccessLink[];
  successTitle?: string;
};

export type WatchedResourceEntry = {
  toastOptions: WatchedResourceToastOptions;
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
  ) => string;
  removeWatchedResource: (id: string) => void;
  updateWatchedResourceToastOptions: (
    id: string,
    toastOptions: Partial<WatchedResourceToastOptions>,
  ) => void;
};

export type WatchedResourcesStoreSlice = {
  actions: WatchedResourcesSliceActions;
  data: WatchedResourcesStoreSliceData;
};

export type WatchedResourceToast = WatchedResourceEntry & {
  id: string;
};
