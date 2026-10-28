import { getUploadProgressToastActions } from '../../shared/sliceActions/uploadProgressToastActions';
import { type UploadsActionsParamsWithStoreSlice } from '../../shared/types/types';
import { type UploadProgressStoreState, type UploadProgressStoreStateSetter } from '../../types';
import { type ExportDiskStoreStateActions, type StartExportDiskUploadParams } from '../types/types';
import {
  clearExportDiskWatchContext,
  performCancelTrackedExportDiskUpload,
} from './exportDiskContextActions';
import { createStartExportDiskUpload } from './startExportDiskUpload';

export const createExportDiskActions = (
  set: UploadProgressStoreStateSetter,
  get: () => UploadProgressStoreState,
): ExportDiskStoreStateActions => {
  const sliceDeps: UploadsActionsParamsWithStoreSlice = { get, set, storeSlice: 'exportDisk' };

  return {
    ...getUploadProgressToastActions(set, get, 'exportDisk'),
    cancelTrackedUpload: (uploadKey): Promise<void> =>
      performCancelTrackedExportDiskUpload(sliceDeps, uploadKey),
    clearExportDiskWatchContext: (uploadKey): void =>
      clearExportDiskWatchContext(sliceDeps, uploadKey),
    startUpload: (uploadKey: string, params: StartExportDiskUploadParams) =>
      createStartExportDiskUpload(sliceDeps, uploadKey, params),
  };
};
