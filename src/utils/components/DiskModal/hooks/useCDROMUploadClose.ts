import { useState } from 'react';

import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { isUploadingDisk } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

type UseCDROMUploadCloseReturn = {
  handleModalClose: () => Promise<void>;
  isUploading: boolean;
  markBackgroundUploadEnded: () => void;
  markBackgroundUploadStarted: () => void;
};

export const useCDROMUploadClose = (
  upload: DataUpload,
  onClose: () => void,
): UseCDROMUploadCloseReturn => {
  const [isBackgroundUploadActive, setIsBackgroundUploadActive] = useState(false);

  const isCdiUploadInProgress = isUploadingDisk(upload?.uploadStatus);
  const isUploading = isCdiUploadInProgress || isBackgroundUploadActive;

  const handleModalClose = async (): Promise<void> => {
    const shouldCancelUpload =
      isCdiUploadInProgress && !isBackgroundUploadActive && upload?.cancelUpload;

    if (shouldCancelUpload) {
      try {
        await upload.cancelUpload();
      } catch (error) {
        kubevirtConsole.error(error);
      }
    }
    setIsBackgroundUploadActive(false);
    onClose();
  };

  const markBackgroundUploadStarted = (): void => {
    setIsBackgroundUploadActive(true);
  };

  const markBackgroundUploadEnded = (): void => {
    setIsBackgroundUploadActive(false);
  };

  return {
    handleModalClose,
    isUploading,
    markBackgroundUploadEnded,
    markBackgroundUploadStarted,
  };
};
