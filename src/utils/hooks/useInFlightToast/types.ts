import { type ExportDiskStoreState } from './features/exportDisk/types/types';
import { type UploadsStoreSlice } from './features/uploads/types/types';
import { type WatchedResourcesStoreSlice } from './features/watchedResources/types/types';

export type InFlightToastStoreState = {
  exportDisk: ExportDiskStoreState;
  uploads: UploadsStoreSlice;
  watchedResources: WatchedResourcesStoreSlice;
};

export type InFlightProgressToastStoreSlice = keyof Omit<
  InFlightToastStoreState,
  'watchedResources'
>;

export type InFlightToastStoreStateSetter = (
  partial:
    | Partial<InFlightToastStoreState>
    | ((state: InFlightToastStoreState) => Partial<InFlightToastStoreState>),
) => void;

type InFlightToastStoreStateGetter = () => InFlightToastStoreState;

export type InFlightToastStoreActionsParams = {
  get: InFlightToastStoreStateGetter;
  set: InFlightToastStoreStateSetter;
};
