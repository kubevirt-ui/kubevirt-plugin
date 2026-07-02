import { TFunction } from 'i18next';

import { ToastActions } from '@kubevirt-utils/hooks/useKubevirtToast';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { UPLOAD_PROGRESS_STATUS } from '../constants';
import { UploadEntry } from '../types';

type CleanupRemovedUploadsParams = {
  addWarningToast: ToastActions['addWarningToast'];
  currentUploads: Record<string, UploadEntry>;
  previousUploads: Record<string, UploadEntry>;
  removeToast: ToastActions['removeToast'];
  t: TFunction;
};

export const cleanupRemovedUploads = ({
  addWarningToast,
  currentUploads,
  previousUploads,
  removeToast,
  t,
}: CleanupRemovedUploadsParams): void => {
  const batchCanceledFileNames: string[] = [];

  Object.entries(previousUploads).forEach(([uploadKey, upload]) => {
    if (!currentUploads[uploadKey]) {
      if (upload.toastId) {
        removeToast(upload.toastId);
      }
      if (upload.status === UPLOAD_PROGRESS_STATUS.UPLOADING) {
        batchCanceledFileNames.push(upload.fileName);
      }
    }
  });

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
