import { type UploadProgressStoreState } from '../../types';
import { type UploadEntry, type UploadProgressStatus } from '../../uploads/types/types';

type ProgressToastHolder = { progressToastState?: UploadEntry };

export const getProgressToastState = (entry?: ProgressToastHolder): UploadEntry | undefined =>
  entry?.progressToastState;

export const getToastId = (entry?: ProgressToastHolder): string | undefined =>
  entry?.progressToastState?.toastId;

export const getTerminalToastShown = (entry?: ProgressToastHolder): boolean | undefined =>
  entry?.progressToastState?.terminalToastShown;

export const getGeneration = (entry?: ProgressToastHolder): number | undefined =>
  entry?.progressToastState?.generation;

export const getUploadStatus = (entry?: ProgressToastHolder): UploadProgressStatus | undefined =>
  entry?.progressToastState?.status;

export const getSliceEntry = (
  state: UploadProgressStoreState,
  storeSlice: keyof UploadProgressStoreState,
  uploadKey: string,
): ProgressToastHolder | undefined =>
  state[storeSlice].data?.[uploadKey] as ProgressToastHolder | undefined;

export const getSliceProgressToast = (
  state: UploadProgressStoreState,
  storeSlice: keyof UploadProgressStoreState,
  uploadKey: string,
): UploadEntry | undefined => getProgressToastState(getSliceEntry(state, storeSlice, uploadKey));
