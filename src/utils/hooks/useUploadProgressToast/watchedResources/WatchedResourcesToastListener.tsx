import { type FC, useEffect } from 'react';

import { useUploadProgressStore } from '@kubevirt-utils/hooks/useUploadProgressToast/uploadProgressStore';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { type AlertVariant } from '@patternfly/react-core';

import { type ToastOptions } from '../../useKubevirtToast/types';
import useKubevirtToast from '../../useKubevirtToast/useKubevirtToast';
import {
  getToastMapperByVariant,
  getToastOptionsToDisplay,
} from '../../useKubevirtToast/utils/utils';
import { useKubevirtTranslation } from '../../useKubevirtTranslation';
import { type WatchedResourceToast } from './types/types';
import { removeWatchedToast } from './utils/watchedResourceUtils';

type WatchedResourceToastListenerProps = {
  watchedResourceToast: WatchedResourceToast;
};

const WatchedResourceToastListener: FC<WatchedResourceToastListenerProps> = ({
  watchedResourceToast,
}) => {
  const [watchData, _loaded, watchError] = useK8sWatchData<K8sResourceCommon>(
    watchedResourceToast.watchDataResource ?? null,
  );

  const { addDangerToast, addInfoToast, addSuccessToast, addWarningToast } = useKubevirtToast();
  const { t } = useKubevirtTranslation();
  useEffect(() => {
    if (!watchedResourceToast && !watchError) {
      return;
    }

    const toastOptionsToDisplay = getToastOptionsToDisplay(
      watchData,
      watchedResourceToast,
      t,
      watchError,
    );

    if (isEmpty(toastOptionsToDisplay)) {
      return;
    }

    const toastByVariant = getToastMapperByVariant({
      addDangerToast,
      addInfoToast,
      addSuccessToast,
      addWarningToast,
    });

    const displayToast = toastByVariant[toastOptionsToDisplay?.variant as AlertVariant];

    displayToast?.(toastOptionsToDisplay as ToastOptions);

    removeWatchedToast(watchedResourceToast.id);
  }, [
    addDangerToast,
    addInfoToast,
    addSuccessToast,
    addWarningToast,
    t,
    watchedResourceToast,
    watchError,
    watchData,
  ]);

  return null;
};

const WatchedResourcesToastListener: FC = () => {
  const watchedResourcesData = useUploadProgressStore((state) => state.watchedResources.data);

  if (isEmpty(watchedResourcesData)) {
    return null;
  }
  return (
    <>
      {Object.entries(watchedResourcesData).map(([id, watchedResource]) => (
        <WatchedResourceToastListener key={id} watchedResourceToast={{ ...watchedResource, id }} />
      ))}
    </>
  );
};

export default WatchedResourcesToastListener;
