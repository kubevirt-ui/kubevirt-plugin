import { abortUploadStream, abortViaDataVolume, runCancelCleanup } from '../../cancel/cancelUpload';
import { UPLOAD_PROGRESS_STATUS } from '../../constants';
import { type UploadsStoreSliceActions } from '../../features/uploads/types/types';
import {
  getGeneration,
  getSliceEntry,
  getSliceProgressToast,
} from '../selectors/uploadEntrySelectors';
import {
  type CancelTrackedUploadOptions,
  type ProgressToastState,
  type StartUploadEntry,
  type UploadsActionsParamsWithStoreSlice,
} from '../types/types';

export const createStartUpload =
  ({
    get,
    set,
    storeSlice,
  }: UploadsActionsParamsWithStoreSlice): UploadsStoreSliceActions['startUpload'] =>
  (uploadKey, entry: StartUploadEntry): number => {
    const generation = (get()[storeSlice].generationsByKey?.[uploadKey] ?? 0) + 1;
    set((state) => ({
      [storeSlice]: {
        ...state[storeSlice],
        data: {
          ...state[storeSlice].data,
          [uploadKey]: {
            progressToastState: {
              blockNavigation: true,
              ...entry,
              generation,
              progress: 0,
              status: UPLOAD_PROGRESS_STATUS.UPLOADING,
            },
          },
        },
        generationsByKey: { ...state[storeSlice].generationsByKey, [uploadKey]: generation },
      },
    }));
    return generation;
  };

export const performCancelTrackedUpload = async (
  { get, storeSlice }: UploadsActionsParamsWithStoreSlice,
  uploadKey: string,
  { removeAfterCancel = false }: CancelTrackedUploadOptions = {},
): Promise<void> => {
  const upload = getSliceProgressToast(get(), storeSlice, uploadKey);
  if (!upload) {
    return;
  }

  const { cancelUpload, dvCluster, dvName, dvNamespace, generation, onCancelCleanup } = upload;

  const aborted =
    (await abortUploadStream(cancelUpload)) ||
    (await abortViaDataVolume(dvName, dvNamespace, dvCluster));

  if (getGeneration(getSliceEntry(get(), storeSlice, uploadKey)) !== generation) {
    return;
  }

  const { markUploadCanceled, removeUpload, stripDataVolumeLinks } = get()[storeSlice].actions;

  if (removeAfterCancel && (!cancelUpload || aborted)) {
    removeUpload(uploadKey);
  } else if (!removeAfterCancel) {
    markUploadCanceled(uploadKey, generation);
    if (aborted) {
      stripDataVolumeLinks(uploadKey);
    }
  }

  await runCancelCleanup(onCancelCleanup);
};

export const getUpload = (
  { get, storeSlice }: UploadsActionsParamsWithStoreSlice,
  uploadKey: string,
): ProgressToastState | undefined => getSliceProgressToast(get(), storeSlice, uploadKey);
