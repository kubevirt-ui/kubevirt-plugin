import { useMemo } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolume } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

import { getDataSourceWatch, getPVCWatch } from './utils';

const useDisksSources = (vm: V1VirtualMachine) => {
  const dataSourcesWatch = useMemo(() => getDataSourceWatch(vm), [vm]);

  const dataSourcesWatchResult = useK8sWatchResources<{ [key: string]: V1beta1DataSource }>(
    dataSourcesWatch,
  );

  const dataSources = useMemo(
    () =>
      Object.values(dataSourcesWatchResult || [])
        .map((watch) => watch.data)
        .filter((data) => !isEmpty(data)),
    [dataSourcesWatchResult],
  );

  const pvcWatches = useMemo(() => getPVCWatch(vm, dataSources), [vm, dataSources]);

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

  const loaded = [
    ...Object.values(dataSourcesWatchResult),
    ...Object.values(pvcWatchesResult),
  ].every((watch) => watch.loaded);

  const loadingError = [
    ...Object.values(dataSourcesWatchResult),
    ...Object.values(pvcWatchesResult),
  ].find((watch) => watch.loadError);

  return { dataSources, loaded, loadingError, pvcs };
};

export default useDisksSources;
