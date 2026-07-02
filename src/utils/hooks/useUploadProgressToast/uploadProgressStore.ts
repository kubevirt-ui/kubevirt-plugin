import { create } from 'zustand';

import {
  performCancelAllPendingUploads,
  performCancelTrackedUpload,
  performCancelUploadsForVm,
} from './cancel/cancelUpload';
import { UPLOAD_PROGRESS_STATUS } from './constants';
import { UploadProgressStoreState } from './types';

export const useUploadProgressStore = create<UploadProgressStoreState>((set, get) => ({
  cancelAllPendingUploads: () => performCancelAllPendingUploads(get),
  cancelTrackedUpload: (uploadKey) => performCancelTrackedUpload(get, uploadKey),
  cancelUploadsForVm: (cluster, namespace, vmName) =>
    performCancelUploadsForVm(get, cluster, namespace, vmName),
  completeUpload: (uploadKey, options) =>
    set((state) => {
      const current = state.uploads[uploadKey];
      if (!current) {
        return state;
      }

      const completeOptions = options ?? {};
      const successLinks = completeOptions.successLinks ?? current.successLinks;

      return {
        uploads: {
          ...state.uploads,
          [uploadKey]: {
            ...current,
            progress: 100,
            resourceName: completeOptions.resourceName ?? current.resourceName,
            resourceUrl: completeOptions.resourceUrl ?? current.resourceUrl,
            status: UPLOAD_PROGRESS_STATUS.SUCCESS,
            successLinks,
          },
        },
      };
    }),
  failUpload: (uploadKey, errorMessage) =>
    set((state) => {
      const current = state.uploads[uploadKey];
      if (!current) {
        return state;
      }

      return {
        uploads: {
          ...state.uploads,
          [uploadKey]: {
            ...current,
            errorMessage,
            status: UPLOAD_PROGRESS_STATUS.ERROR,
          },
        },
      };
    }),
  getUpload: (uploadKey) => get().uploads[uploadKey],
  markUploadCanceled: (uploadKey) =>
    set((state) => {
      const current = state.uploads[uploadKey];
      if (!current) {
        return state;
      }

      return {
        uploads: {
          ...state.uploads,
          [uploadKey]: {
            ...current,
            status: UPLOAD_PROGRESS_STATUS.CANCELED,
          },
        },
      };
    }),
  removeUpload: (uploadKey) =>
    set((state) => {
      const nextUploads = { ...state.uploads };
      delete nextUploads[uploadKey];
      return { uploads: nextUploads };
    }),
  startUpload: (uploadKey, entry) =>
    set((state) => ({
      uploads: {
        ...state.uploads,
        [uploadKey]: {
          blockNavigation: true,
          ...entry,
          progress: 0,
          status: UPLOAD_PROGRESS_STATUS.UPLOADING,
        },
      },
    })),
  tryMarkTerminalToastShown: (uploadKey) => {
    const current = get().uploads[uploadKey];
    if (!current || current.terminalToastShown) {
      return false;
    }

    set((state) => {
      const entry = state.uploads[uploadKey];
      if (!entry || entry.terminalToastShown) {
        return state;
      }
      return {
        uploads: {
          ...state.uploads,
          [uploadKey]: { ...entry, terminalToastShown: true },
        },
      };
    });
    return true;
  },
  trySetToastId: (uploadKey, toastId) => {
    const current = get().uploads[uploadKey];
    if (!current || current.toastId) {
      return false;
    }

    set((state) => {
      const entry = state.uploads[uploadKey];
      if (!entry || entry.toastId) {
        return state;
      }
      return {
        uploads: {
          ...state.uploads,
          [uploadKey]: { ...entry, toastId },
        },
      };
    });
    return true;
  },
  updateProgress: (uploadKey, progress) =>
    set((state) => {
      const current = state.uploads[uploadKey];
      if (!current || current.status !== UPLOAD_PROGRESS_STATUS.UPLOADING) {
        return state;
      }

      return {
        uploads: {
          ...state.uploads,
          [uploadKey]: { ...current, progress },
        },
      };
    }),
  uploads: {},
}));
