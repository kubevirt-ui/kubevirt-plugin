import { type InFlightToastStoreState } from '../../types';
import { type ProgressToastState, type UploadProgressStatus } from '../types/types';

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
  storeSlice: keyof InFlightToastStoreState,
  uploadKey: string,
): ProgressToastHolder | undefined =>
  state[storeSlice].data?.[uploadKey] as ProgressToastHolder | undefined;

export const getSliceProgressToast = (
  state: InFlightToastStoreState,
  storeSlice: keyof InFlightToastStoreState,
  uploadKey: string,
): ProgressToastState | undefined =>
  getProgressToastState(getSliceEntry(state, storeSlice, uploadKey));
