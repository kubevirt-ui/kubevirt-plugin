import { UPLOAD_PROGRESS_STATUS } from '../../constants';
import {
  type UploadsStoreSliceActions,
  type UploadsStoreSliceData,
} from '../../features/uploads/types/types';
import {
  canUpdateUploadingEntry,
  failUploadState,
  markUploadCanceledState,
  omitRemovedSuccessLinks,
} from '../../uploadStatusUpdates';
import { getProgressToastState, getSliceEntry } from '../selectors/uploadEntrySelectors';
import {
  type CompleteUploadOptions,
  type UploadsActionsParamsWithStoreSlice,
} from '../types/types';

export const completeUploadState = (
  data: UploadsStoreSliceData,
  uploadKey: string,
  options?: CompleteUploadOptions,
): UploadsStoreSliceData => {
  const currentEntry = data?.[uploadKey];
  const current = getProgressToastState(currentEntry);
  const completeOptions = options ?? {};
  if (!canUpdateUploadingEntry(current, completeOptions.expectedGeneration)) {
    return data;
  }

  const successLinks = omitRemovedSuccessLinks(
    completeOptions.successLinks ?? current.successLinks,
    current.omittedLinkUrls,
  );

  return {
    ...data,
    [uploadKey]: {
      ...currentEntry,
      progressToastState: {
        ...current,
        progress: 100,
        resourceName: completeOptions.resourceName ?? current.resourceName,
        resourceUrl: completeOptions.resourceUrl ?? current.resourceUrl,
        status: UPLOAD_PROGRESS_STATUS.SUCCESS,
        successLinks,
      },
    },
  };
};

export const createFailUpload =
  ({
    set,
    storeSlice,
  }: UploadsActionsParamsWithStoreSlice): UploadsStoreSliceActions['failUpload'] =>
  (uploadKey, errorMessage, expectedGeneration): void =>
    set((state) => ({
      [storeSlice]: {
        ...state[storeSlice],
        data: failUploadState(
          state[storeSlice].data as UploadsStoreSliceData,
          uploadKey,
          errorMessage,
          expectedGeneration,
        ),
      },
    }));

export const createMarkUploadCanceled = (
  { set, storeSlice }: UploadsActionsParamsWithStoreSlice,
  uploadKey: string,
  expectedGeneration?: number,
): void =>
  set((state) => ({
    [storeSlice]: {
      ...state[storeSlice],
      ...markUploadCanceledState(
        state[storeSlice].data as UploadsStoreSliceData,
        uploadKey,
        expectedGeneration,
      ),
    },
  }));

export const createUpdateProgress =
  ({ set, storeSlice }: UploadsActionsParamsWithStoreSlice) =>
  (uploadId: string, progress: number): void =>
    set((state) => {
      const sliceEntry = getSliceEntry(state, storeSlice, uploadId);
      const current = getProgressToastState(sliceEntry);
      if (current?.status !== UPLOAD_PROGRESS_STATUS.UPLOADING) {
        return state;
      }

      return {
        [storeSlice]: {
          ...state[storeSlice],
          data: {
            ...state[storeSlice].data,
            [uploadId]: {
              ...sliceEntry,
              progressToastState: { ...current, progress },
            },
          },
        },
      };
    });

export const removeUpload = (
  { set, storeSlice }: UploadsActionsParamsWithStoreSlice,
  uploadKey: string,
): void =>
  set((state) => {
    const nextUploads = { ...state[storeSlice].data };
    delete nextUploads[uploadKey];
    return {
      [storeSlice]: {
        ...state[storeSlice],
        data: nextUploads,
      },
    };
  });
