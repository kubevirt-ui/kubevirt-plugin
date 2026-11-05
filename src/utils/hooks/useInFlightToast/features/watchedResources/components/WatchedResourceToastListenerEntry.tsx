import { type FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { type WatchedResourceToast } from '../types/types';
import { syncWatchedResourceToast } from '../utils/displayWatchedResourceToast';
import {
  getToastOptionsByResourceStatus,
  showInitialToast,
} from '../utils/watchedResourceToastOptions';

type WatchedResourceToastListenerEntryProps = {
  watchedResourceToast: WatchedResourceToast;
};

const WatchedResourceToastListenerEntry: FC<WatchedResourceToastListenerEntryProps> = ({
  watchedResourceToast,
}) => {
  const [watchData, loaded, watchError] = useK8sWatchData<K8sResourceCommon>(
    watchedResourceToast.watchDataResource ?? null,
  );

  const toastActions = useKubevirtToast();
  const navigate = useNavigate();
  const hasShownInitialToastRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    const isFinalResultReceived = watchedResourceToast.toastOptions.error || loaded;

    if (!isFinalResultReceived && !hasShownInitialToastRef.current) {
      showInitialToast(watchedResourceToast, toastActions);
      hasShownInitialToastRef.current = true;
      return;
    }

    const toastOptionsToDisplay = getToastOptionsByResourceStatus({
      navigate,
      resource: watchData,
      t,
      watchedResourceToast,
      watchError,
    });

    if (!toastOptionsToDisplay) {
      return;
    }

    syncWatchedResourceToast(toastOptionsToDisplay, toastActions, watchedResourceToast.id);
  }, [loaded, navigate, t, toastActions, watchData, watchError, watchedResourceToast]);

  return null;
};

export default WatchedResourceToastListenerEntry;
