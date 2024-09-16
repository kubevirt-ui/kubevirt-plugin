import { useMemo } from 'react';

import { IoK8sApiCoreV1PersistentVolume } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

import { getPVCWatch } from './utils';

const useDisksSources = (vm: V1VirtualMachine) => {
  const pvcWatches = useMemo(() => getPVCWatch(vm), [vm]);

  const pvcWatchesResult = useK8sWatchResources<{ [key: string]: IoK8sApiCoreV1PersistentVolume }>(
    pvcWatches,
  );

  const pvcs = useMemo(
    () =>
      Object.values(pvcWatchesResult || [])
        .map((watch) => watch.data)
        .filter((data) => !isEmpty(data)),
    [pvcWatchesResult],
  );

  const loaded = Object.values(pvcWatchesResult).every(
    (watch) => watch.loaded || !isEmpty(watch.loadError),
  );

  const loadingError = Object.values(pvcWatchesResult).find((watch) => {
    return !isEmpty(watch.loadError) && watch.loadError?.code !== 404;
  });

  return { loaded, loadingError, pvcs };
};

export default useDisksSources;
