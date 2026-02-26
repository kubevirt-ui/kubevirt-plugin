import { useCallback, useEffect, useRef, useState } from 'react';

import {
  UploadAlertConfig,
  uploadAlertConfig,
  UploadAlertStatus,
} from '@virtualmachines/details/tabs/configuration/storage/utils/constants';

type UseUploadAlertResult = {
  alertConfig: null | UploadAlertConfig;
  dismissAlert: () => void;
  onUploadStarted: (uploadPromise: Promise<unknown>) => void;
  uploadError: string;
};

export const useUploadAlert = (): UseUploadAlertResult => {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [uploadStatus, setUploadStatus] = useState<null | UploadAlertStatus>(null);
  const [uploadError, setUploadError] = useState('');

  const onUploadStarted = useCallback((uploadPromise: Promise<unknown>): void => {
    setUploadStatus('uploading');
    setUploadError('');
    uploadPromise
      .then(() => {
        if (mountedRef.current) setUploadStatus('success');
      })
      .catch((err: unknown) => {
        if (mountedRef.current) {
          setUploadStatus('error');
          setUploadError(err instanceof Error ? err.message : '');
        }
      });
  }, []);

  const dismissAlert = useCallback((): void => setUploadStatus(null), []);

  const alertConfig = uploadStatus ? uploadAlertConfig[uploadStatus] : null;

  return { alertConfig, dismissAlert, onUploadStarted, uploadError };
};
