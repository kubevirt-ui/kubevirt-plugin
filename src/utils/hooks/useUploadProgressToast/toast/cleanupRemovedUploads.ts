import { type TFunction } from 'i18next';

import { type ToastActions } from '@kubevirt-utils/hooks/useKubevirtToast';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { type UploadEntry } from '../types';

type CleanupRemovedUploadsParams = {
  addWarningToast: ToastActions['addWarningToast'];
  currentUploads: Record<string, UploadEntry>;
  previousUploads: Record<string, UploadEntry>;
  processedToasts: Set<string>;
  removeToast: ToastActions['removeToast'];
  t: TFunction;
};

export const cleanupRemovedUploads = ({
  addWarningToast,
  currentUploads,
  previousUploads,
  processedToasts,
  removeToast,
  t,
}: CleanupRemovedUploadsParams): void => {
  const batchCanceledFileNames: string[] = [];

  for (const [uploadKey, upload] of Object.entries(previousUploads)) {
    if (!currentUploads[uploadKey]) {
      processedToasts.delete(uploadKey);
      if (upload.toastId) {
        removeToast(upload.toastId);
      }
      if (upload.status === UPLOAD_PROGRESS_STATUS.UPLOADING) {
        batchCanceledFileNames.push(upload.fileName);
      }
    }
  }

  if (isEmpty(batchCanceledFileNames)) {
    return;
  }

  let toastConfig = {
    title: t('Upload of {{fileName}} was aborted', { fileName: batchCanceledFileNames[0] }),
  };

  if (batchCanceledFileNames.length > 1) {
    toastConfig = {
      title: t('{{uploadsCount}} uploads were aborted', {
        uploadsCount: batchCanceledFileNames.length,
      }),
    };
  }

  addWarningToast(toastConfig);
};
