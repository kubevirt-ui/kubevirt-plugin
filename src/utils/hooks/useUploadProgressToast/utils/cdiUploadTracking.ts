import {
  getUploadErrorMessage,
  UPLOAD_STATUS,
  UploadError,
} from '@kubevirt-utils/hooks/useCDIUpload/types';

import { useUploadProgressStore } from '../uploadProgressStore';

import { RegisterCdiUploadParams, SyncCdiUploadParams } from './types';
import { isTerminalUploadStatus } from './uploadTitles';

const applyCdiStatusToStore = (
  uploadKey: string,
  uploadStatus: UPLOAD_STATUS,
  uploadError?: UploadError,
): void => {
  const store = useUploadProgressStore.getState();

  if (uploadStatus === UPLOAD_STATUS.ERROR) {
    store.failUpload(uploadKey, getUploadErrorMessage(uploadError));
    return;
  }

  if (uploadStatus === UPLOAD_STATUS.CANCELED) {
    store.markUploadCanceled(uploadKey);
  }
};

export const syncCdiUploadProgressAndFailures = ({
  progress,
  uploadError,
  uploadKey,
  uploadStatus,
}: SyncCdiUploadParams): void => {
  const store = useUploadProgressStore.getState();
  const upload = store.getUpload(uploadKey);

  if (!upload) {
    return;
  }

  if (progress != null) {
    store.updateProgress(uploadKey, progress);
  }

  if (uploadStatus != null) {
    applyCdiStatusToStore(uploadKey, uploadStatus, uploadError);
  }
};

export const registerCdiUpload = ({
  cancelUpload,
  fileName,
  metadata,
  uploadKey,
}: RegisterCdiUploadParams): void => {
  const store = useUploadProgressStore.getState();
  const existing = store.getUpload(uploadKey);

  if (existing && !isTerminalUploadStatus(existing.status)) {
    store.removeUpload(uploadKey);
  }

  store.startUpload(uploadKey, { ...metadata, cancelUpload, fileName });
};
