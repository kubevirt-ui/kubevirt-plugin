import {
  performCancelTrackedUpload,
  performCancelUploadsForVm,
  performCancelWizardPendingUploads,
} from '../../cancel/cancelUpload';
import {
  stripLinksForDeletedBootableVolume,
  stripLinksForDeletedDataVolume,
  stripVmStorageLinksFromUploads,
} from '../../cancel/stripVmStorageLinks';
import { type UploadProgressStoreState, type UploadProgressStoreStateSetter } from '../../types';
import { completeUploadState, markUploadCanceledState } from '../../uploadStatusUpdates';
import { type UploadEntry, type UploadsStoreStateActions } from '../types/types';
import {
  createFailUpload,
  createStartUpload,
  createStripDataVolumeLinks,
  createTryMarkTerminalToastShown,
  createTrySetToastId,
  createUpdateProgress,
} from './uploadsActions';

export const createUploadsActions = (
  set: UploadProgressStoreStateSetter,
  get: () => UploadProgressStoreState,
): UploadsStoreStateActions => {
  const deps = { get, set };

  return {
    cancelTrackedUpload: (uploadKey): Promise<void> => performCancelTrackedUpload(get, uploadKey),
    cancelUploadsForVm: (cluster, namespace, vmName): Promise<void> =>
      performCancelUploadsForVm(get, cluster, namespace, vmName),
    cancelWizardPendingUploads: (uploadKeys): Promise<void> =>
      performCancelWizardPendingUploads(get, uploadKeys),
    completeUpload: (uploadKey, options): void =>
      set((state) => ({
        uploads: {
          ...state.uploads,
          ...completeUploadState({ data: state.uploads.data }, uploadKey, options),
        },
      })),
    failUpload: createFailUpload(deps),
    getUpload: (uploadKey): UploadEntry | undefined => get().uploads.data?.[uploadKey],
    markUploadCanceled: (uploadKey, expectedGeneration): void =>
      set((state) => ({
        uploads: {
          ...state.uploads,
          ...markUploadCanceledState({ data: state.uploads.data }, uploadKey, expectedGeneration),
        },
      })),
    removeUpload: (uploadKey): void =>
      set((state) => {
        const nextUploads = { ...state.uploads.data };
        delete nextUploads[uploadKey];
        return {
          uploads: {
            ...state.uploads,
            data: nextUploads,
          },
        };
      }),
    startUpload: createStartUpload(deps),
    stripBootableVolumeLinks: (namespace, name, cluster): void =>
      set((state) => ({
        uploads: {
          ...state.uploads,
          data: stripLinksForDeletedBootableVolume(state.uploads.data, namespace, name, cluster),
        },
      })),
    stripDataVolumeLinks: createStripDataVolumeLinks(deps),
    stripDataVolumeLinksForResource: (dvName, dvNamespace, cluster): void =>
      set((state) => ({
        uploads: {
          ...state.uploads,
          data: stripLinksForDeletedDataVolume(state.uploads.data, dvName, dvNamespace, cluster),
        },
      })),
    stripVmStorageLinksForVm: (...args): void =>
      set((state) => ({
        uploads: {
          ...state.uploads,
          data: stripVmStorageLinksFromUploads(state.uploads.data, ...args),
        },
      })),
    tryMarkTerminalToastShown: createTryMarkTerminalToastShown(deps),
    trySetToastId: createTrySetToastId(deps),
    updateProgress: createUpdateProgress(deps),
  };
};
