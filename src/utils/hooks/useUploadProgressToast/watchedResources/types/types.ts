import { type KubevirtToastOptions } from '@kubevirt-utils/hooks/useKubevirtToast/types';
import { type FleetWatchK8sResource } from '@stolostron/multicluster-sdk';

export type WatchedResourceData = {
  toastOptions?: KubevirtToastOptions;
  watchDataResource: FleetWatchK8sResource | undefined;
};

type WatchedResourcesActions = {
  pushNewWatchedToast: (watchedToastData: WatchedResourceData) => void;
  removeWatchedToast: (id: string) => void;
};

export type WatchedResourceStoreState = {
  actions: WatchedResourcesActions;
  data: Record<string, WatchedResourceData>;
};

export type WatchedResourceToast = WatchedResourceData & {
  id: string;
};
