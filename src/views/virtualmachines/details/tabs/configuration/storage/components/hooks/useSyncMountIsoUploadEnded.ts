import { useEffect, useRef } from 'react';

import {
  UPLOAD_ALERT_STATUS,
  UploadAlertStatus,
  useMountIsoUploadStore,
} from '@kubevirt-utils/hooks/mountIsoUploadStore';

export const useSyncMountIsoUploadEnded = (
  cdromUploadKey: string,
  markBackgroundUploadEnded: () => void,
): void => {
  const persistedUploadStatus = useMountIsoUploadStore(
    (state) => state.uploads[cdromUploadKey]?.status,
  );
  const previousStatusRef = useRef<undefined | UploadAlertStatus>(undefined);
  const previousKeyRef = useRef(cdromUploadKey);

  useEffect(() => {
    if (previousKeyRef.current !== cdromUploadKey) {
      previousStatusRef.current = undefined;
      previousKeyRef.current = cdromUploadKey;
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
  }, [cdromUploadKey, markBackgroundUploadEnded, persistedUploadStatus]);
};
