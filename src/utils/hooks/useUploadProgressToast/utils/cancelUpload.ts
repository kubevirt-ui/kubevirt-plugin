import { cancelUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { UploadProgressStoreState } from './types';

type StoreAccessor = () => UploadProgressStoreState;

export const performCancelTrackedUpload = async (
  get: StoreAccessor,
  uploadKey: string,
): Promise<void> => {
  const upload = get().uploads[uploadKey];
  if (!upload) {
    return;
  }

  let cancelUploadSucceeded = false;

  if (upload.cancelUpload) {
    try {
      await upload.cancelUpload();
      cancelUploadSucceeded = true;
    } catch (error) {
      kubevirtConsole.error('Upload cancellation error:', error);
    }
  }

  if (!cancelUploadSucceeded && upload.dvName && upload.dvNamespace) {
    try {
      await cancelUploadPVC(upload.dvName, upload.dvNamespace, upload.dvCluster);
    } catch {
      // DV may already have been deleted
    }
  }

  get().markUploadCanceled(uploadKey);

  if (upload.onCancelCleanup) {
    try {
      await upload.onCancelCleanup();
    } catch (error) {
      kubevirtConsole.error('Upload cancel cleanup failed:', error);
    }
  }
};
