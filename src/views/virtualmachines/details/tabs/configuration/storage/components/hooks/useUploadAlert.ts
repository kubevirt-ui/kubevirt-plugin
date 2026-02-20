import { useState } from 'react';

import {
  uploadAlertConfig,
  UploadAlertStatus,
} from '@virtualmachines/details/tabs/configuration/storage/utils/constants';

export const useUploadAlert = () => {
  const [uploadStatus, setUploadStatus] = useState<null | UploadAlertStatus>(null);
  const [uploadError, setUploadError] = useState('');

  const onUploadStarted = (uploadPromise: Promise<unknown>) => {
    setUploadStatus('uploading');
    setUploadError('');
    uploadPromise
      .then(() => setUploadStatus('success'))
      .catch((err) => {
        setUploadStatus('error');
        setUploadError(err?.message || '');
      });
  };

  const dismissAlert = () => setUploadStatus(null);

  const alertConfig = uploadStatus ? uploadAlertConfig[uploadStatus] : null;

  return { alertConfig, dismissAlert, onUploadStarted, uploadError };
};
