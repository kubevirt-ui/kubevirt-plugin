import { type UploadsStoreSliceData } from '../../features/uploads/types/types';
import { type InFlightToastStoreState, type InFlightToastStoreStateSetter } from '../../types';
import { type InFlightToastStoreActions, type ProgressToastState } from '../types/types';
import {
  createStartUpload,
  getUpload,
  performCancelTrackedUpload,
} from './inFlightUploadStartAndCancelActions';
import {
  completeUploadState,
  createFailUpload,
  createMarkUploadCanceled,
  createUpdateProgress,
  removeUpload,
} from './inFlightUploadStateActions';
import {
  createStripDataVolumeLinks,
  createTryMarkTerminalToastShown,
  createTrySetToastId,
} from './inFlightUploadToastActions';

export const getInFlightToastSliceActions = (
  set: InFlightToastStoreStateSetter,
  get: () => InFlightToastStoreState,
  storeSlice: keyof InFlightToastStoreState,
): InFlightToastStoreActions => {
  const deps = { get, set, storeSlice };

  return {
    cancelTrackedUpload: (uploadKey): Promise<void> => performCancelTrackedUpload(deps, uploadKey),
    completeUpload: (uploadKey, options): void =>
      set((state) => ({
        [storeSlice]: {
          ...state[storeSlice],
          data: completeUploadState(
            state[storeSlice].data as UploadsStoreSliceData,
            uploadKey,
            options,
          ),
        },
      })),
    failUpload: createFailUpload(deps),
    getUpload: (uploadKey): ProgressToastState | undefined => getUpload(deps, uploadKey),
    markUploadCanceled: (uploadKey, expectedGeneration): void =>
      createMarkUploadCanceled(deps, uploadKey, expectedGeneration),
    removeUpload: (uploadKey): void => removeUpload(deps, uploadKey),
    startUpload: createStartUpload(deps),
    stripDataVolumeLinks: (uploadKey): void => createStripDataVolumeLinks(deps, uploadKey),
    tryMarkTerminalToastShown: createTryMarkTerminalToastShown(deps),
    trySetToastId: createTrySetToastId(deps),
    updateProgress: createUpdateProgress(deps),
  };
};
