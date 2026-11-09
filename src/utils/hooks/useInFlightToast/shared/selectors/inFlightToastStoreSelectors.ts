import {
  type ExportDiskStoreStateActions,
  type ExportDiskStoreStateData,
} from '../../features/exportDisk/types/types';
import { type UploadsStoreSliceActions } from '../../features/uploads/types/types';
import { type UploadsStoreSliceData } from '../../features/uploads/types/types';
import {
  type WatchedResourcesSliceActions,
  type WatchedResourcesStoreSliceData,
} from '../../features/watchedResources/types/types';
import { useInFlightToastStore } from '../../inFlightToastStore';
import { type InFlightProgressToastStoreSlice, type InFlightToastStoreState } from '../../types';
import { type ProgressToastState, type UploadProgressStatus } from '../types/types';

export const getUploadsActions = (): UploadsStoreSliceActions =>
  useInFlightToastStore.getState().uploads.actions;

export const getExportDiskActions = (): ExportDiskStoreStateActions =>
  useInFlightToastStore.getState().exportDisk.actions;

export const getUploadsData = (): UploadsStoreSliceData =>
  useInFlightToastStore.getState().uploads.data;

export const getExportDiskData = (): ExportDiskStoreStateData =>
  useInFlightToastStore.getState().exportDisk.data;

export const getWatchedResourcesActions = (): WatchedResourcesSliceActions =>
  useInFlightToastStore.getState().watchedResources.actions;

export const getWatchedResourcesData = (): WatchedResourcesStoreSliceData =>
  useInFlightToastStore.getState().watchedResources.data;

type ProgressToastHolder = { progressToastState?: ProgressToastState };

export const getProgressToastState = (
  entry?: ProgressToastHolder,
): ProgressToastState | undefined => entry?.progressToastState;

export const getToastId = (entry?: ProgressToastHolder): string | undefined =>
  entry?.progressToastState?.toastId;

export const getTerminalToastShown = (entry?: ProgressToastHolder): boolean | undefined =>
  entry?.progressToastState?.terminalToastShown;

export const getGeneration = (entry?: ProgressToastHolder): number | undefined =>
  entry?.progressToastState?.generation;

export const getUploadStatus = (entry?: ProgressToastHolder): UploadProgressStatus | undefined =>
  entry?.progressToastState?.status;

export const getSliceEntry = (
  state: InFlightToastStoreState,
  storeSlice: InFlightProgressToastStoreSlice,
  uploadKey: string,
): ProgressToastHolder | undefined =>
  state[storeSlice].data?.[uploadKey] as ProgressToastHolder | undefined;

export const getSliceProgressToast = (
  state: InFlightToastStoreState,
  storeSlice: InFlightProgressToastStoreSlice,
  uploadKey: string,
): ProgressToastState | undefined =>
  getProgressToastState(getSliceEntry(state, storeSlice, uploadKey));
