import { type UploadProgressStoreState, type UploadsActionsParams } from '../../types';

export type CancelTrackedUploadOptions = {
  removeAfterCancel?: boolean;
};

export type UploadsActionsParamsWithStoreSlice = UploadsActionsParams & {
  storeSlice: keyof UploadProgressStoreState;
};
