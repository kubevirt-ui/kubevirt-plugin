import { getInFlightToastSliceActions } from '@kubevirt-utils/hooks/useInFlightToast/shared/sliceActions/inFlightToastActions';
import { type UploadsActionsParamsWithStoreSlice } from '@kubevirt-utils/hooks/useInFlightToast/shared/types/types';
import {
  type InFlightToastStoreState,
  type InFlightToastStoreStateSetter,
} from '@kubevirt-utils/hooks/useInFlightToast/types';

import { type ExportDiskStoreStateActions, type StartExportDiskUploadParams } from '../types/types';
import {
  clearExportDiskWatchContext,
  performCancelTrackedExportDiskUpload,
} from './exportDiskContextActions';
import { createStartExportDiskUpload } from './startExportDiskUpload';

export const createExportDiskActions = (
  set: InFlightToastStoreStateSetter,
  get: () => InFlightToastStoreState,
): ExportDiskStoreStateActions => {
  const sliceDeps: UploadsActionsParamsWithStoreSlice = { get, set, storeSlice: 'exportDisk' };

  return {
    ...getInFlightToastSliceActions(set, get, 'exportDisk'),
    cancelTrackedUpload: (uploadKey): Promise<void> =>
      performCancelTrackedExportDiskUpload(sliceDeps, uploadKey),
    clearExportDiskWatchContext: (uploadKey): void =>
      clearExportDiskWatchContext(sliceDeps, uploadKey),
    startUpload: (uploadKey: string, params: StartExportDiskUploadParams) =>
      createStartExportDiskUpload(sliceDeps, uploadKey, params),
  };
};
