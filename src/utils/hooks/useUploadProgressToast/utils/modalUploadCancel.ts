import {
  DROPDOWN_FORM_SELECTION,
  isUploadVolumeSource,
} from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { DataUpload, UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { useUploadProgressStore } from '../uploadProgressStore';

export const isCdiUploadInProgress = (upload?: DataUpload): boolean =>
  upload?.uploadStatus === UPLOAD_STATUS.UPLOADING;

export const preservesUploadOnModalClose = (sourceType: DROPDOWN_FORM_SELECTION): boolean =>
  isUploadVolumeSource(sourceType);

type CancelTrackedUploadOnModalCloseParams = {
  sourceType?: DROPDOWN_FORM_SELECTION;
  upload?: DataUpload;
  uploadKey?: string;
};

export const cancelTrackedUploadOnModalClose = ({
  sourceType,
  upload,
  uploadKey,
}: CancelTrackedUploadOnModalCloseParams): void => {
  const shouldPreserveUpload = sourceType != null && preservesUploadOnModalClose(sourceType);

  if (shouldPreserveUpload || !isCdiUploadInProgress(upload)) {
    return;
  }

  if (uploadKey) {
    void useUploadProgressStore.getState().cancelTrackedUpload(uploadKey);
    return;
  }

  void (async () => {
    try {
      await upload?.cancelUpload?.();
    } catch (error) {
      kubevirtConsole.error(error);
    }
  })();
};
