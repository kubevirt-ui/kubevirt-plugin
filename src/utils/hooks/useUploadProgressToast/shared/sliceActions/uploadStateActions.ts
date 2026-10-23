import { UPLOAD_PROGRESS_STATUS } from '../../constants';
import {
  type CompleteUploadOptions,
  type UploadsStoreStateActions,
  type UploadsStoreStateData,
} from '../../uploads/types/types';
import {
  canUpdateUploadingEntry,
  failUploadState,
  markUploadCanceledState,
  omitRemovedSuccessLinks,
} from '../../uploadStatusUpdates';
import { type UploadsActionsParamsWithStoreSlice } from '../types/types';

export const completeUploadState = (
  data: UploadsStoreStateData,
  uploadKey: string,
  options?: CompleteUploadOptions,
): UploadsStoreStateData => {
  const current = data?.[uploadKey]?.progressToastState;
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
  }: UploadsActionsParamsWithStoreSlice): UploadsStoreStateActions['failUpload'] =>
  (uploadKey, errorMessage, expectedGeneration): void =>
    set((state) => ({
      [storeSlice]: {
        ...state[storeSlice],
        data: failUploadState(
          state[storeSlice].data as UploadsStoreStateData,
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
        state[storeSlice].data as UploadsStoreStateData,
        uploadKey,
        expectedGeneration,
      ),
    },
  }));

export const createUpdateProgress =
  ({ set, storeSlice }: UploadsActionsParamsWithStoreSlice) =>
  (uploadId: string, progress: number): void =>
    set((state) => {
      const sliceData = state[storeSlice].data?.[uploadId];
      const current = sliceData?.progressToastState;
      if (current?.status !== UPLOAD_PROGRESS_STATUS.UPLOADING) {
        return state;
      }

      return {
        [storeSlice]: {
          ...state[storeSlice],
          data: {
            ...state[storeSlice].data,
            [uploadId]: {
              ...sliceData,
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
