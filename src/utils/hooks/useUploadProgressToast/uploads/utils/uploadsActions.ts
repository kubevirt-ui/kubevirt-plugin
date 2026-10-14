import { stripDataVolumeLinksFromUpload } from '../../cancel/stripVmStorageLinks';
import { UPLOAD_PROGRESS_STATUS } from '../../constants';
import { type UploadsActionsParams } from '../../types';
import { failUploadState } from '../../uploadStatusUpdates';
import { type StartUploadEntry, type UploadsStoreStateActions } from '../types/types';

export const createFailUpload =
  ({ set }: UploadsActionsParams): UploadsStoreStateActions['failUpload'] =>
  (uploadKey, errorMessage, expectedGeneration): void =>
    set((state) => ({
      uploads: {
        ...state.uploads,
        ...failUploadState(
          { data: state.uploads.data },
          uploadKey,
          errorMessage,
          expectedGeneration,
        ),
      },
    }));

export const createStartUpload =
  ({ get, set }: UploadsActionsParams): UploadsStoreStateActions['startUpload'] =>
  (uploadKey, entry: StartUploadEntry): number => {
    const generation = (get().uploads.generationsByKey?.[uploadKey] ?? 0) + 1;
    set((state) => ({
      uploads: {
        ...state.uploads,
        data: {
          ...state.uploads.data,
          [uploadKey]: {
            blockNavigation: true,
            ...entry,
            generation,
            progress: 0,
            status: UPLOAD_PROGRESS_STATUS.UPLOADING,
          },
        },
        generationsByKey: { ...state.uploads.generationsByKey, [uploadKey]: generation },
      },
    }));
    return generation;
  };

export const createStripDataVolumeLinks =
  ({ set }: UploadsActionsParams): UploadsStoreStateActions['stripDataVolumeLinks'] =>
  (uploadKey): void =>
    set((state) => {
      const current = state.uploads.data?.[uploadKey];
      if (!current) {
        return state;
      }

      const nextUpload = stripDataVolumeLinksFromUpload(current, uploadKey);
      if (nextUpload === current) {
        return state;
      }

      return {
        uploads: {
          ...state.uploads,
          data: {
            ...state.uploads.data,
            [uploadKey]: nextUpload,
          },
        },
      };
    });

export const createTryMarkTerminalToastShown =
  ({ get, set }: UploadsActionsParams): UploadsStoreStateActions['tryMarkTerminalToastShown'] =>
  (uploadKey): boolean => {
    const current = get().uploads.data?.[uploadKey];
    if (!current || current.terminalToastShown) {
      return false;
    }

    set((state) => {
      const entry = state.uploads.data[uploadKey];
      if (!entry || entry.terminalToastShown) {
        return state;
      }
      return {
        uploads: {
          ...state.uploads,
          data: {
            ...state.uploads.data,
            [uploadKey]: { ...entry, terminalToastShown: true },
          },
        },
      };
    });
    return true;
  };

export const createTrySetToastId =
  ({ get, set }: UploadsActionsParams): UploadsStoreStateActions['trySetToastId'] =>
  (uploadKey, toastId): boolean => {
    const current = get().uploads.data?.[uploadKey];
    if (!current || current.toastId) {
      return false;
    }

    set((state) => {
      const entry = state.uploads.data?.[uploadKey];
      if (!entry || entry.toastId) {
        return state;
      }
      return {
        uploads: {
          ...state.uploads,
          data: {
            ...state.uploads.data,
            [uploadKey]: { ...entry, toastId },
          },
        },
      };
    });
    return true;
  };

export const createUpdateProgress =
  ({ set }: UploadsActionsParams): UploadsStoreStateActions['updateProgress'] =>
  (uploadKey, progress): void =>
    set((state) => {
      const current = state.uploads.data?.[uploadKey];
      if (current?.status !== UPLOAD_PROGRESS_STATUS.UPLOADING) {
        return state;
      }

      return {
        uploads: {
          ...state.uploads,
          data: {
            ...state.uploads.data,
            [uploadKey]: { ...current, progress },
          },
        },
      };
    });
