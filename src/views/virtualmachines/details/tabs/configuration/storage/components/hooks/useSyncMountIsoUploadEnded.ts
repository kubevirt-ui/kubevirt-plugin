import { useEffect, useRef } from 'react';

import {
  UPLOAD_ALERT_STATUS,
  UploadAlertStatus,
  useMountIsoUploadStore,
} from '@kubevirt-utils/hooks/mountIsoUploadStore';

export const useSyncMountIsoUploadEnded = (
  vmUploadKey: string,
  markBackgroundUploadEnded: () => void,
): void => {
  const persistedUploadStatus = useMountIsoUploadStore(
    (state) => state.uploads[vmUploadKey]?.status,
  );
  const previousStatusRef = useRef<undefined | UploadAlertStatus>(undefined);
  const previousKeyRef = useRef(vmUploadKey);

  useEffect(() => {
    if (previousKeyRef.current !== vmUploadKey) {
      previousStatusRef.current = undefined;
      previousKeyRef.current = vmUploadKey;
      return;
    }

    const previousStatus = previousStatusRef.current;

    if (
      previousStatus === UPLOAD_ALERT_STATUS.UPLOADING &&
      persistedUploadStatus !== UPLOAD_ALERT_STATUS.UPLOADING
    ) {
      markBackgroundUploadEnded();
    }

    previousStatusRef.current = persistedUploadStatus;
  }, [markBackgroundUploadEnded, persistedUploadStatus, vmUploadKey]);
};
