import {
  type DROPDOWN_FORM_SELECTION,
  isUploadVolumeSource,
} from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import { type DataUpload, UPLOAD_STATUS } from '@kubevirt-utils/hooks/useCDIUpload/types';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { getUploadsActions } from '../shared/selectors/inFlightToastStoreSelectors';

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
    getUploadsActions()
      .cancelTrackedUpload(uploadKey)
      .catch(() => {});
    return;
  }

  void (async (): Promise<void> => {
    try {
      await upload?.cancelUpload?.();
    } catch (error) {
      kubevirtConsole.error(error);
    }
  })();
};
