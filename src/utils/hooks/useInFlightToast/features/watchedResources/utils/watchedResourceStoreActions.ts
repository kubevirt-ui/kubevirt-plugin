import { produce } from 'immer';

import { getRandomChars } from '@kubevirt-utils/utils/utils';

import { type InFlightToastStoreStateSetter } from '../../../types';
import { type WatchedResourceEntry, type WatchedResourceKeyPrefix } from '../types/types';

const generateWatchedResourceId = (keyPrefix: WatchedResourceKeyPrefix): string =>
  `${keyPrefix}-${getRandomChars(8)}`;

export const createNewWatchedResource = (
  watchedResourceEntry: WatchedResourceEntry,
  set: InFlightToastStoreStateSetter,
  keyPrefix: WatchedResourceKeyPrefix,
): void => {
  const id = generateWatchedResourceId(keyPrefix);
  set((state) => ({
    watchedResources: produce(state.watchedResources, (draft) => {
      draft.data[id] = watchedResourceEntry;
    }),
  }));
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
