import { produce } from 'immer';

import { getRandomChars } from '@kubevirt-utils/utils/utils';

import { type InFlightToastStoreStateSetter } from '../../../types';
import {
  type WatchedResourceEntry,
  type WatchedResourceKeyPrefix,
  type WatchedResourceToastOptions,
} from '../types/types';

const generateWatchedResourceId = (keyPrefix: WatchedResourceKeyPrefix): string =>
  `${keyPrefix}-${getRandomChars(8)}`;

export const createNewWatchedResource = (
  watchedResourceEntry: WatchedResourceEntry,
  set: InFlightToastStoreStateSetter,
  keyPrefix: WatchedResourceKeyPrefix,
): string => {
  const id = generateWatchedResourceId(keyPrefix);
  set((state) => ({
    watchedResources: produce(state.watchedResources, (draft) => {
      draft.data[id] = watchedResourceEntry;
    }),
  }));
  return id;
};

export const removeWatchedResourceFromSlice = (
  id: string,
  set: InFlightToastStoreStateSetter,
): void => {
  set((state) => ({
    watchedResources: produce(state.watchedResources, (draft) => {
      delete draft.data[id];
    }),
  }));
};

export const updateWatchedResourceToastOptionsInSlice = (
  id: string,
  toastOptions: Partial<WatchedResourceToastOptions>,
  set: InFlightToastStoreStateSetter,
): void => {
  set((state) => {
    if (!state.watchedResources.data[id]) {
      return state;
    }

    return {
      watchedResources: produce(state.watchedResources, (draft) => {
        draft.data[id].toastOptions = {
          ...draft.data[id].toastOptions,
          ...toastOptions,
        };
      }),
    };
  });
};
