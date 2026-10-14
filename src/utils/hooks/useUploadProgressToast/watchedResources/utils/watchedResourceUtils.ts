import { getRandomChars } from '@kubevirt-utils/utils/utils';

import { type UploadProgressStoreSetState } from '../../types';
import { useUploadProgressStore } from '../../uploadProgressStore';
import { type WatchedResourceData } from '../types/types';

const generateWatchedToastId = (): string => `watched-toast-${getRandomChars(8)}`;

export const applyPushNewWatchedToast = (
  watchedToastData: WatchedResourceData,
  set: UploadProgressStoreSetState,
): void => {
  const id = generateWatchedToastId();
  set((state) => ({
    watchedResources: {
      ...state.watchedResources,
      data: { ...state.watchedResources.data, [id]: watchedToastData },
    },
  }));
};

export const applyRemoveWatchedToast = (id: string, set: UploadProgressStoreSetState): void => {
  set(({ watchedResources }) => {
    const watchedResourcesData = { ...watchedResources.data };
    delete watchedResourcesData[id];
    return { watchedResources: { ...watchedResources, data: watchedResourcesData } };
  });
};

export const pushNewWatchedToast = (watchedToastData: WatchedResourceData): void => {
  useUploadProgressStore.getState().watchedResources.actions.pushNewWatchedToast(watchedToastData);
};

export const removeWatchedToast = (id: string): void => {
  useUploadProgressStore.getState().watchedResources.actions.removeWatchedToast(id);
};
