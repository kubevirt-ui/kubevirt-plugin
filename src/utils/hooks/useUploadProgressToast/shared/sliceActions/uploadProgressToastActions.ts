import { type UploadProgressStoreState, type UploadProgressStoreStateSetter } from '../../types';
import {
  type UploadEntry,
  type UploadProgressActions,
  type UploadsStoreStateData,
} from '../../uploads/types/types';
import {
  createStartUpload,
  getUpload,
  performCancelTrackedUpload,
} from './uploadStartAndCancelActions';
import {
  completeUploadState,
  createFailUpload,
  createMarkUploadCanceled,
  createUpdateProgress,
  removeUpload,
} from './uploadStateActions';
import {
  createStripDataVolumeLinks,
  createTryMarkTerminalToastShown,
  createTrySetToastId,
} from './uploadToastActions';

export const getUploadProgressToastActions = (
  set: UploadProgressStoreStateSetter,
  get: () => UploadProgressStoreState,
  storeSlice: keyof UploadProgressStoreState,
): UploadProgressActions => {
  const deps = { get, set, storeSlice };

  return {
    cancelTrackedUpload: (uploadKey): Promise<void> => performCancelTrackedUpload(deps, uploadKey),
    completeUpload: (uploadKey, options): void =>
      set((state) => ({
        [storeSlice]: {
          ...state[storeSlice],
          data: completeUploadState(
            state[storeSlice].data as UploadsStoreStateData,
            uploadKey,
            options,
          ),
        },
      })),
    failUpload: createFailUpload(deps),
    getUpload: (uploadKey): UploadEntry | undefined => getUpload(deps, uploadKey),
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
