import { type UploadsStoreState } from './uploads/types/types';

export type UploadProgressStoreState = {
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
