import type { UploadError } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { getUploadErrorMessage, UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/types';

import type { RegisterCdiUploadParams, SyncCdiUploadParams } from '../types';
import { useUploadProgressStore } from '../uploadProgressStore';

const applyCdiStatusToStore = (
  uploadKey: string,
  uploadStatus: UPLOAD_STATUS,
  uploadError?: UploadError,
  expectedGeneration?: number,
): void => {
  const store = useUploadProgressStore.getState();

  if (uploadStatus === UPLOAD_STATUS.ERROR) {
    store.failUpload(uploadKey, getUploadErrorMessage(uploadError), expectedGeneration);
    return;
  }

  if (uploadStatus === UPLOAD_STATUS.CANCELED) {
    store.markUploadCanceled(uploadKey, expectedGeneration);
  }
};

export const syncCdiUploadProgressAndFailures = ({
  expectedGeneration,
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

  if (expectedGeneration !== undefined && upload.generation !== expectedGeneration) {
    return;
  }

  if (progress != null) {
    store.updateProgress(uploadKey, progress);
  }

  if (uploadStatus != null) {
    applyCdiStatusToStore(uploadKey, uploadStatus, uploadError, expectedGeneration);
  }
};

export const registerCdiUpload = ({
  cancelUpload,
  fileName,
  metadata,
  uploadKey,
}: RegisterCdiUploadParams): number =>
  useUploadProgressStore.getState().startUpload(uploadKey, { ...metadata, cancelUpload, fileName });
