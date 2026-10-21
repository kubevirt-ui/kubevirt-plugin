import { getUploadProgressToastActions } from '../../shared/sliceActions/uploadProgressToastActions';
import { type UploadProgressStoreState, type UploadProgressStoreStateSetter } from '../../types';
import { type ExportDiskStoreStateActions } from '../types/types';

export const createExportDiskActions = (
  set: UploadProgressStoreStateSetter,
  get: () => UploadProgressStoreState,
): ExportDiskStoreStateActions => getUploadProgressToastActions(set, get, 'exportDisk');
