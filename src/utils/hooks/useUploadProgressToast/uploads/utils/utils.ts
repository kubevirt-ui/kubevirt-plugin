import {
  performCancelUploadsForVm,
  performCancelWizardPendingUploads,
} from '../../cancel/cancelUpload';
import {
  stripLinksForDeletedBootableVolume,
  stripLinksForDeletedDataVolume,
  stripVmStorageLinksFromUploads,
} from '../../cancel/stripVmStorageLinks';
import { getUploadProgressToastActions } from '../../shared/sliceActions/uploadProgressToastActions';
import { type UploadProgressStoreState, type UploadProgressStoreStateSetter } from '../../types';
import { type UploadsStoreStateActions, type UploadsStoreStateData } from '../types/types';

export const createUploadsActions = (
  set: UploadProgressStoreStateSetter,
  get: () => UploadProgressStoreState,
): UploadsStoreStateActions => {
  return {
    ...getUploadProgressToastActions(set, get, 'uploads'),
    cancelUploadsForVm: (cluster, namespace, vmName): Promise<void> =>
      performCancelUploadsForVm(get, cluster, namespace, vmName),
    cancelWizardPendingUploads: (uploadKeys): Promise<void> =>
      performCancelWizardPendingUploads(get, uploadKeys),
    stripBootableVolumeLinks: (namespace, name, cluster): void =>
      set((state) => ({
        uploads: {
          ...state.uploads,
          data: stripLinksForDeletedBootableVolume(
            state.uploads.data as UploadsStoreStateData,
            namespace,
            name,
            cluster,
          ),
        },
      })),
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
  };
};
