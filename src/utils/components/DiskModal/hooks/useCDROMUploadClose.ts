import { useRef } from 'react';

import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { isUploadingDisk } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

type UseCDROMUploadCloseReturn = {
  handleModalClose: () => Promise<void>;
  isUploading: boolean;
  markBackgroundUploadStarted: () => void;
};

export const useCDROMUploadClose = (
  upload: DataUpload,
  onClose: () => void,
): UseCDROMUploadCloseReturn => {
  const isBackgroundUploadInProgress = useRef(false);
  const isUploading = isUploadingDisk(upload?.uploadStatus);

  const handleModalClose = async (): Promise<void> => {
    const shouldCancelUpload =
      isUploading && !isBackgroundUploadInProgress.current && upload?.cancelUpload;

    if (shouldCancelUpload) {
      try {
        await upload.cancelUpload();
      } catch (error) {
        kubevirtConsole.error(error);
      }
    }
    isBackgroundUploadInProgress.current = false;
    onClose();
  };

  const markBackgroundUploadStarted = (): void => {
    isBackgroundUploadInProgress.current = true;
  };

  return { handleModalClose, isUploading, markBackgroundUploadStarted };
};
