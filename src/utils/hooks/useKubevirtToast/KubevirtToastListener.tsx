import { type FC, useEffect } from 'react';

import {
  removeWatchedToast,
  type WatchedToastData,
  watchedToastSignal,
} from '@kubevirt-utils/signals/toastRequestResultSignal';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { type AlertVariant } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';

import { useKubevirtTranslation } from '../useKubevirtTranslation';

import { type ToastOptions } from './types';
import useKubevirtToast from './useKubevirtToast';
import { getToastMapperByVariant, getToastOptionsToDisplay } from './utils/utils';

type ResourceDataWatcherProps = {
  toastToWatch: WatchedToastData;
};

const ResourceDataWatcher: FC<ResourceDataWatcherProps> = ({ toastToWatch }) => {
  const [watchedResource, _loaded, watchError] = useK8sWatchData<K8sResourceCommon>(
    toastToWatch.watchDataResource ?? null,
  );

  const { addDangerToast, addInfoToast, addSuccessToast, addWarningToast } = useKubevirtToast();
  const { t } = useKubevirtTranslation();
  useEffect(() => {
    if (!watchedResource && !watchError) {
      return;
    }

    const toastOptionsToDisplay = getToastOptionsToDisplay(
      watchedResource,
      toastToWatch,
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

    removeWatchedToast(toastToWatch.id);
  }, [
    addDangerToast,
    addInfoToast,
    addSuccessToast,
    addWarningToast,
    t,
    toastToWatch,
    watchError,
    watchedResource,
  ]);

  return null;
};

const KubevirtToastListener: FC = () => {
  useSignals();
  const toastsToWatch = watchedToastSignal.value;

  if (isEmpty(toastsToWatch)) {
    return null;
  }
  return (
    <>
      {toastsToWatch?.map((entry) => (
        <ResourceDataWatcher key={entry.id} toastToWatch={entry} />
      ))}
    </>
  );
};

export default KubevirtToastListener;
