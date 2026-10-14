import type { UploadError } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { getUploadErrorMessage, UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/types';

import { useUploadProgressStore } from '../uploadProgressStore';

import { type RegisterCdiUploadParams, type SyncCdiUploadParams } from '../uploads/types/types';

const applyCdiStatusToStore = (
  uploadKey: string,
  uploadStatus: UPLOAD_STATUS,
  uploadError?: UploadError,
  expectedGeneration?: number,
): void => {
  const { failUpload, markUploadCanceled } = useUploadProgressStore.getState().uploads.actions;

  if (uploadStatus === UPLOAD_STATUS.ERROR) {
    failUpload(uploadKey, getUploadErrorMessage(uploadError), expectedGeneration);
    return;
  }

  if (uploadStatus === UPLOAD_STATUS.CANCELED) {
    markUploadCanceled(uploadKey, expectedGeneration);
  }
};

export const syncCdiUploadProgressAndFailures = ({
  expectedGeneration,
  progress,
  uploadError,
  uploadKey,
  uploadStatus,
}: SyncCdiUploadParams): void => {
  const { getUpload, updateProgress } = useUploadProgressStore.getState().uploads.actions;
  const upload = getUpload(uploadKey);

  if (!upload) {
    return;
  }

  if (expectedGeneration !== undefined && upload.generation !== expectedGeneration) {
    return;
  }

  if (progress != null) {
    updateProgress(uploadKey, progress);
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
  useUploadProgressStore
    .getState()
    .uploads.actions?.startUpload(uploadKey, { ...metadata, cancelUpload, fileName });
