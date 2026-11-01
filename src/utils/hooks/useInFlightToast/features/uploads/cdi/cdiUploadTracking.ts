import type { UploadError } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { getUploadErrorMessage, UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { getUploadsActions } from '@kubevirt-utils/hooks/useInFlightToast/shared/selectors/inFlightToastStoreSelectors';

import { type RegisterCdiUploadParams, type SyncCdiUploadParams } from '../types/types';

const applyCdiStatusToStore = (
  uploadKey: string,
  uploadStatus: UPLOAD_STATUS,
  uploadError?: UploadError,
  expectedGeneration?: number,
): void => {
  const { failUpload, markUploadCanceled } = getUploadsActions();

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
  const { getUpload, updateProgress } = getUploadsActions();
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
  getUploadsActions().startUpload(uploadKey, { ...metadata, cancelUpload, fileName });
