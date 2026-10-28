import type { FC } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';

import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { mapSliceDataToProgressToastData } from './shared/utils/utils';
import { cleanupRemovedUploads } from './toast/cleanupRemovedUploads';
import { type UploadProgressStoreState } from './types';
import { useUploadProgressStore } from './uploadProgressStore';
import { syncUploadToasts } from './uploadToastSync';

type UploadProgressToastSliceListenerProps = {
  storeSlice: keyof UploadProgressStoreState;
};

const UploadProgressToastSliceListener: FC<UploadProgressToastSliceListenerProps> = ({
  storeSlice,
}) => {
  const navigate = useNavigate();
  const { t } = useKubevirtTranslation();
  const { addDangerToast, addInfoToast, addSuccessToast, addWarningToast, removeToast } =
    useKubevirtToast();

  const sliceData = useUploadProgressStore((state) => state[storeSlice].data);
  const actions = useUploadProgressStore((state) => state[storeSlice].actions);

  const progressToastData = useMemo(() => mapSliceDataToProgressToastData(sliceData), [sliceData]);
  const prevProgressToastDataRef = useRef(progressToastData);
  const processedToastsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    cleanupRemovedUploads({
      addWarningToast,
      currentUploads: progressToastData,
      previousUploads: prevProgressToastDataRef.current,
      processedToasts: processedToastsRef.current,
      removeToast,
      t,
    });

    syncUploadToasts(
      progressToastData,
      {
        addDangerToast,
        addInfoToast,
        addSuccessToast,
        addWarningToast,
        cancelTrackedUpload: actions.cancelTrackedUpload,
        getUpload: actions.getUpload,
        navigate,
        removeToast,
        removeUpload: actions.removeUpload,
        storeSlice,
        t,
        tryMarkTerminalToastShown: actions.tryMarkTerminalToastShown,
        trySetToastId: actions.trySetToastId,
      },
      processedToastsRef.current,
    );

    prevProgressToastDataRef.current = progressToastData;
  }, [
    actions,
    addDangerToast,
    addInfoToast,
    addSuccessToast,
    addWarningToast,
    navigate,
    progressToastData,
    removeToast,
    storeSlice,
    t,
  ]);

  return null;
};

export default UploadProgressToastSliceListener;
