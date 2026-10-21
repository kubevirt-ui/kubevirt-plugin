import { type ExportDiskStoreState } from './exportDisk/types/types';
import { type UploadsStoreState } from './uploads/types/types';

export type UploadProgressStoreState = {
  exportDisk: ExportDiskStoreState;
  uploads: UploadsStoreState;
};

export type UploadProgressStoreStateSetter = (
  partial:
    | Partial<UploadProgressStoreState>
    | ((state: UploadProgressStoreState) => Partial<UploadProgressStoreState>),
) => void;

type UploadProgressStoreStateGetter = () => UploadProgressStoreState;

export type UploadsActionsParams = {
  get: UploadProgressStoreStateGetter;
  set: UploadProgressStoreStateSetter;
};
