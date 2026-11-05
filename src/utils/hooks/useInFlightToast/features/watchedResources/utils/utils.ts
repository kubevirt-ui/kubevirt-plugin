import { type InFlightToastStoreState, type InFlightToastStoreStateSetter } from '../../../types';
import { type WatchedResourcesSliceActions } from '../types/types';
import {
  createNewWatchedResource,
  removeWatchedResourceFromSlice,
  updateWatchedResourceToastOptionsInSlice,
} from './watchedResourceStoreActions';

export const createWatchedResourcesActions = (
  set: InFlightToastStoreStateSetter,
  _get: () => InFlightToastStoreState,
): WatchedResourcesSliceActions => ({
  pushNewWatchedResource: (watchedResourceEntry, keyPrefix): string =>
    createNewWatchedResource(watchedResourceEntry, set, keyPrefix),
  removeWatchedResource: (id): void => removeWatchedResourceFromSlice(id, set),
  updateWatchedResourceToastOptions: (id, toastOptions): void =>
    updateWatchedResourceToastOptionsInSlice(id, toastOptions, set),
});
