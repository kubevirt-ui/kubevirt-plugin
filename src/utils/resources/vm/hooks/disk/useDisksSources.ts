import { useMemo } from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useKubevirtWatchResources from '@multicluster/hooks/useKubevirtWatchResources';

import { getPVCAndDVWatches } from './utils';

const useDisksSources = (vm: V1VirtualMachine) => {
  const { dvWatches, pvcWatches } = useMemo(() => getPVCAndDVWatches(vm), [vm]);

  const pvcWatchesResult = useKubevirtWatchResources<{
    [key: string]: IoK8sApiCoreV1PersistentVolumeClaim;
  }>(pvcWatches);

  const dvWatchesResult = useKubevirtWatchResources<{ [key: string]: V1beta1DataVolume }>(
    dvWatches,
  );

  const dvs = useMemo(
    () =>
      Object.values(dvWatchesResult || [])
        .map((watch) => watch.data)
        .filter((dv) => !isEmpty(dv)),
    [dvWatchesResult],
  );

  const pvcs = useMemo(
    () =>
      Object.values(pvcWatchesResult || [])
        .map((watch) => watch.data)
        .filter((pvc) => !isEmpty(pvc)),
    [pvcWatchesResult],
  );

  const loaded = useMemo(
    () =>
      Object.values(pvcWatchesResult).every((watch) => watch.loaded || !isEmpty(watch.loadError)),
    [pvcWatchesResult],
  );

  const loadingError = useMemo(
    () =>
      Object.values(pvcWatchesResult).find((watch) => {
        return !isEmpty(watch.loadError) && watch.loadError?.code !== 404;
      })?.loadError,
    [pvcWatchesResult],
  );

  return { dvs, loaded, loadingError, pvcs };
};

export default useDisksSources;
