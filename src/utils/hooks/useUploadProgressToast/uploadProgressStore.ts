import { create } from 'zustand';

import {
  performCancelTrackedUpload,
  performCancelUploadsForVm,
  performClearWizardPendingUploadKeys,
} from './cancel/cancelUpload';
import {
  stripLinksForDeletedBootableVolume,
  stripLinksForDeletedDataVolume,
  stripVmStorageLinksFromUploads,
} from './cancel/stripVmStorageLinks';
import { type UploadEntry, type UploadProgressStoreState } from './types';
import {
  addWizardPendingUploadKey,
  performStartUpload,
  performStripDataVolumeLinks,
  performTryMarkTerminalToastShown,
  performTrySetToastId,
  performUpdateProgress,
} from './upload/uploadProgressStoreActions';
import {
  completeUploadState,
  failUploadState,
  markUploadCanceledState,
} from './uploadStatusUpdates';

export const useUploadProgressStore = create<UploadProgressStoreState>((set, get) => ({
  addWizardPendingUploadKey: (uploadKey): void =>
    set((state) => ({
      wizardPendingUploadKeys: addWizardPendingUploadKey(state.wizardPendingUploadKeys, uploadKey),
    })),
  cancelTrackedUpload: (uploadKey): Promise<void> => performCancelTrackedUpload(get, uploadKey),
  cancelUploadsForVm: (cluster, namespace, vmName): Promise<void> =>
    performCancelUploadsForVm(get, cluster, namespace, vmName),
  cancelWizardPendingUploads: (): void => {
    performClearWizardPendingUploadKeys(get, set).catch(() => {});
  },
  completeUpload: (uploadKey, options): void =>
    set((state) => completeUploadState(state, uploadKey, options)),
  failUpload: (uploadKey, errorMessage, expectedGeneration): void =>
    set((state) => failUploadState(state, uploadKey, errorMessage, expectedGeneration)),
  generationsByKey: {},
  getUpload: (uploadKey): UploadEntry | undefined => get().uploads[uploadKey],
  getWizardPendingUploadKeys: (): string[] => get().wizardPendingUploadKeys,
  markUploadCanceled: (uploadKey, expectedGeneration): void =>
    set((state) => markUploadCanceledState(state, uploadKey, expectedGeneration)),
  removeUpload: (uploadKey): void =>
    set((state) => {
      const nextUploads = { ...state.uploads };
      delete nextUploads[uploadKey];
      return { uploads: nextUploads };
    }),
  startUpload: (uploadKey, entry): number => performStartUpload(get, set, uploadKey, entry),
  stripBootableVolumeLinks: (namespace, name, cluster): void =>
    set((state) => ({
      uploads: stripLinksForDeletedBootableVolume(state.uploads, namespace, name, cluster),
    })),
  stripDataVolumeLinks: (uploadKey): void => performStripDataVolumeLinks(set, uploadKey),
  stripDataVolumeLinksForResource: (dvName, dvNamespace, cluster): void =>
    set((state) => ({
      uploads: stripLinksForDeletedDataVolume(state.uploads, dvName, dvNamespace, cluster),
    })),
  stripVmStorageLinksForVm: (...args): void =>
    set((state) => ({
      uploads: stripVmStorageLinksFromUploads(state.uploads, ...args),
    })),
  tryMarkTerminalToastShown: (uploadKey): boolean =>
    performTryMarkTerminalToastShown(get, set, uploadKey),
  trySetToastId: (uploadKey, toastId): boolean =>
    performTrySetToastId(get, set, uploadKey, toastId),
  updateProgress: (uploadKey, progress): void => performUpdateProgress(set, uploadKey, progress),
  uploads: {},
  wizardPendingUploadKeys: [],
}));
