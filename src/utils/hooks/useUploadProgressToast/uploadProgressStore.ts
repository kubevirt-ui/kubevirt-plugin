import { create } from 'zustand';

import {
  performCancelTrackedUpload,
  performCancelUploadsForVm,
  performCancelWizardPendingUploads,
} from './cancel/cancelUpload';
import {
  stripDataVolumeLinksFromUpload,
  stripLinksForDeletedBootableVolume,
  stripLinksForDeletedDataVolume,
  stripVmStorageLinksFromUploads,
} from './cancel/stripVmStorageLinks';
import { UPLOAD_PROGRESS_STATUS } from './constants';
import { type UploadEntry, type UploadProgressStoreState } from './types';
import {
  completeUploadState,
  failUploadState,
  markUploadCanceledState,
} from './uploadStatusUpdates';

export const useUploadProgressStore = create<UploadProgressStoreState>((set, get) => ({
  cancelTrackedUpload: (uploadKey): Promise<void> => performCancelTrackedUpload(get, uploadKey),
  cancelUploadsForVm: (cluster, namespace, vmName): Promise<void> =>
    performCancelUploadsForVm(get, cluster, namespace, vmName),
  cancelWizardPendingUploads: (wizardVm, wizardBootableVolumeKeys): Promise<void> =>
    performCancelWizardPendingUploads(get, wizardVm, wizardBootableVolumeKeys),
  completeUpload: (uploadKey, options): void =>
    set((state) => completeUploadState(state, uploadKey, options)),
  failUpload: (uploadKey, errorMessage, expectedGeneration): void =>
    set((state) => failUploadState(state, uploadKey, errorMessage, expectedGeneration)),
  generationsByKey: {},
  getUpload: (uploadKey): UploadEntry | undefined => get().uploads[uploadKey],
  markUploadCanceled: (uploadKey, expectedGeneration): void =>
    set((state) => markUploadCanceledState(state, uploadKey, expectedGeneration)),
  removeUpload: (uploadKey): void =>
    set((state) => {
      const nextUploads = { ...state.uploads };
      delete nextUploads[uploadKey];
      return { uploads: nextUploads };
    }),
  startUpload: (uploadKey, entry): number => {
    const generation = (get().generationsByKey[uploadKey] ?? 0) + 1;
    set((state) => ({
      generationsByKey: { ...state.generationsByKey, [uploadKey]: generation },
      uploads: {
        ...state.uploads,
        [uploadKey]: {
          blockNavigation: true,
          ...entry,
          generation,
          progress: 0,
          status: UPLOAD_PROGRESS_STATUS.UPLOADING,
        },
      },
    }));
    return generation;
  },
  stripBootableVolumeLinks: (namespace, name, cluster): void =>
    set((state) => ({
      uploads: stripLinksForDeletedBootableVolume(state.uploads, namespace, name, cluster),
    })),
  stripDataVolumeLinks: (uploadKey): void =>
    set((state) => {
      const current = state.uploads[uploadKey];
      if (!current) {
        return state;
      }

      const nextUpload = stripDataVolumeLinksFromUpload(current);
      if (nextUpload === current) {
        return state;
      }

      return {
        uploads: {
          ...state.uploads,
          [uploadKey]: nextUpload,
        },
      };
    }),
  stripDataVolumeLinksForResource: (dvName, dvNamespace, cluster): void =>
    set((state) => ({
      uploads: stripLinksForDeletedDataVolume(state.uploads, dvName, dvNamespace, cluster),
    })),
  stripVmStorageLinksForVm: (...args): void =>
    set((state) => ({
      uploads: stripVmStorageLinksFromUploads(state.uploads, ...args),
    })),
  tryMarkTerminalToastShown: (uploadKey): boolean => {
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
  trySetToastId: (uploadKey, toastId): boolean => {
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
  updateProgress: (uploadKey, progress): void =>
    set((state) => {
      const current = state.uploads[uploadKey];
      if (current?.status !== UPLOAD_PROGRESS_STATUS.UPLOADING) {
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
