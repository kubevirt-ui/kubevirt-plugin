import { FC, useEffect, useRef } from 'react';
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
  const uploads = useUploadProgressStore((state) => state.uploads);
  const tryMarkTerminalToastShown = useUploadProgressStore(
    (state) => state.tryMarkTerminalToastShown,
  );
  const trySetToastId = useUploadProgressStore((state) => state.trySetToastId);
  const removeUpload = useUploadProgressStore((state) => state.removeUpload);
  const prevUploadsRef = useRef(useUploadProgressStore.getState().uploads);

  useEffect(() => {
    cleanupRemovedUploads({
      addWarningToast,
      currentUploads: uploads,
      previousUploads: prevUploadsRef.current,
      removeToast,
      t,
    });

    syncUploadToasts(uploads, {
      addDangerToast,
      addInfoToast,
      addSuccessToast,
      addWarningToast,
      navigate,
      removeToast,
      removeUpload,
      t,
      tryMarkTerminalToastShown,
      trySetToastId,
    });

    prevUploadsRef.current = uploads;
  }, [
    addDangerToast,
    addInfoToast,
    addSuccessToast,
    addWarningToast,
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
