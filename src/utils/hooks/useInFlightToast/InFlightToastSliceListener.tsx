import type { FC } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';

import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { useInFlightToastStore } from './inFlightToastStore';
import { cleanupRemovedUploads } from './shared/utils/progressToastSync/cleanupRemovedUploads';
import { syncUploadToasts } from './shared/utils/progressToastSync/uploadToastSync';
import { mapSliceDataToProgressToastData } from './shared/utils/utils';
import { type InFlightProgressToastStoreSlice } from './types';

type UploadProgressToastSliceListenerProps = {
  storeSlice: InFlightProgressToastStoreSlice;
};

const UploadProgressToastSliceListener: FC<UploadProgressToastSliceListenerProps> = ({
  storeSlice,
}) => {
  const navigate = useNavigate();
  const { t } = useKubevirtTranslation();
  const { addDangerToast, addInfoToast, addSuccessToast, addWarningToast, removeToast } =
    useKubevirtToast();

  const sliceData = useInFlightToastStore((state) => state[storeSlice].data);
  const actions = useInFlightToastStore((state) => state[storeSlice].actions);

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
