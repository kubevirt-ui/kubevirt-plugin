import {
  performCancelUploadsForVm,
  performCancelWizardPendingUploads,
} from '../../../cancel/cancelUpload';
import {
  stripLinksForDeletedBootableVolume,
  stripLinksForDeletedDataVolume,
  stripVmStorageLinksFromUploads,
} from '../../../cancel/stripVmStorageLinks';
import { getInFlightToastSliceActions } from '../../../shared/sliceActions/inFlightToastActions';
import { type InFlightToastStoreState, type InFlightToastStoreStateSetter } from '../../../types';
import { type UploadsStoreSliceActions, type UploadsStoreSliceData } from '../types/types';

export const createUploadsActions = (
  set: InFlightToastStoreStateSetter,
  get: () => InFlightToastStoreState,
): UploadsStoreSliceActions => {
  return {
    ...getInFlightToastSliceActions(set, get, 'uploads'),
    cancelUploadsForVm: (cluster, namespace, vmName): Promise<void> =>
      performCancelUploadsForVm(get, cluster, namespace, vmName),
    cancelWizardPendingUploads: (uploadKeys): Promise<void> =>
      performCancelWizardPendingUploads(get, uploadKeys),
    stripBootableVolumeLinks: (namespace, name, cluster): void =>
      set((state) => ({
        uploads: {
          ...state.uploads,
          data: stripLinksForDeletedBootableVolume(
            state.uploads.data as UploadsStoreSliceData,
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
