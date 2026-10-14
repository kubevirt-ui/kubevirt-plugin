import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { cleanupRemovedUploads } from './toast/cleanupRemovedUploads';
import { useUploadProgressStore } from './uploadProgressStore';
import { syncUploadToasts } from './uploadToastSync';

const UploadProgressToastListener: FC = () => {
  const navigate = useNavigate();
  const { t } = useKubevirtTranslation();
  const { addDangerToast, addInfoToast, addSuccessToast, addWarningToast, removeToast } =
    useKubevirtToast();
  const uploads = useUploadProgressStore((state) => state.uploads.data);
  const cancelTrackedUpload = useUploadProgressStore(
    (state) => state.uploads.actions?.cancelTrackedUpload,
  );
  const tryMarkTerminalToastShown = useUploadProgressStore(
    (state) => state.uploads.actions?.tryMarkTerminalToastShown,
  );
  const trySetToastId = useUploadProgressStore((state) => state.uploads.actions?.trySetToastId);
  const removeUpload = useUploadProgressStore((state) => state.uploads.actions?.removeUpload);
  const prevUploadsRef = useRef(useUploadProgressStore.getState().uploads.data);
  const processedToastsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    cleanupRemovedUploads({
      addWarningToast,
      currentUploads: uploads,
      previousUploads: prevUploadsRef.current,
      processedToasts: processedToastsRef.current,
      removeToast,
      t,
    });

    syncUploadToasts(
      uploads,
      {
        addDangerToast,
        addInfoToast,
        addSuccessToast,
        addWarningToast,
        cancelTrackedUpload,
        navigate,
        removeToast,
        removeUpload,
        t,
        tryMarkTerminalToastShown,
        trySetToastId,
      },
      processedToastsRef.current,
    );

    prevUploadsRef.current = uploads;
  }, [
    addDangerToast,
    addInfoToast,
    addSuccessToast,
    addWarningToast,
    cancelTrackedUpload,
    navigate,
    removeToast,
    removeUpload,
    t,
    tryMarkTerminalToastShown,
    trySetToastId,
    uploads,
  ]);

  return null;
};

export default UploadProgressToastListener;
