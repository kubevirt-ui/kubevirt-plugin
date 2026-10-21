import { abortUploadStream, abortViaDataVolume, runCancelCleanup } from '../../cancel/cancelUpload';
import { UPLOAD_PROGRESS_STATUS } from '../../constants';
import {
  type StartUploadEntry,
  type UploadEntry,
  type UploadsStoreStateActions,
} from '../../uploads/types/types';
import {
  type CancelTrackedUploadOptions,
  type UploadsActionsParamsWithStoreSlice,
} from '../types/types';

export const createStartUpload =
  ({
    get,
    set,
    storeSlice,
  }: UploadsActionsParamsWithStoreSlice): UploadsStoreStateActions['startUpload'] =>
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
  const upload = get()[storeSlice].data?.[uploadKey]?.progressToastState;
  if (!upload) {
    return;
  }

  const { cancelUpload, dvCluster, dvName, dvNamespace, generation, onCancelCleanup } = upload;

  const aborted =
    (await abortUploadStream(cancelUpload)) ||
    (await abortViaDataVolume(dvName, dvNamespace, dvCluster));

  if (get()[storeSlice]?.data?.[uploadKey]?.progressToastState?.generation !== generation) {
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
): UploadEntry | undefined => get()[storeSlice].data?.[uploadKey]?.progressToastState;
