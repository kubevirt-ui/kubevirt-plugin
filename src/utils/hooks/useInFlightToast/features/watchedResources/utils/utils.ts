import { type InFlightToastStoreState, type InFlightToastStoreStateSetter } from '../../../types';
import {
  type WatchedResourceEntry,
  type WatchedResourceKeyPrefix,
  type WatchedResourcesSliceActions,
} from '../types/types';
import {
  createNewWatchedResource,
  removeWatchedResourceFromSlice,
} from './watchedResourceStoreActions';

export const createWatchedResourcesActions = (
  set: InFlightToastStoreStateSetter,
  _get: () => InFlightToastStoreState,
): WatchedResourcesSliceActions => ({
  pushNewWatchedResource: (
    watchedResourceData: WatchedResourceEntry,
    keyPrefix: WatchedResourceKeyPrefix,
  ): void => createNewWatchedResource(watchedResourceData, set, keyPrefix),
  removeWatchedResource: (id): void => removeWatchedResourceFromSlice(id, set),
});
