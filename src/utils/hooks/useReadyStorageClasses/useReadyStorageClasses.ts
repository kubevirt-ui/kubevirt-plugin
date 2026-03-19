import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  StorageProfileModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useStorageClasses from '@kubevirt-utils/hooks/useStorageClasses/useStorageClasses';
import { getName } from '@kubevirt-utils/resources/shared';
import { StorageProfile } from '@kubevirt-utils/types/storage';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { getReadyStorageClasses } from './utils';

type UseReadyStorageClasses = (cluster?: string) => [
  {
    readyStorageClasses: IoK8sApiStorageV1StorageClass[];
    sortedStorageClasses: string[];
  },
  boolean,
];

const useReadyStorageClasses: UseReadyStorageClasses = (cluster) => {
  const clusterParam = useClusterParam();
  const resolvedCluster = cluster || clusterParam;

  const [storageClasses, scLoaded] = useStorageClasses(resolvedCluster);

  const [storageProfiles, spLoaded] = useK8sWatchData<StorageProfile[]>({
    cluster: resolvedCluster,
    groupVersionKind: modelToGroupVersionKind(StorageProfileModel),
    isList: true,
  });

  const readyStorageClasses = useMemo(() => {
    if (!scLoaded || !spLoaded || !storageClasses) return storageClasses;

    if (isEmpty(storageProfiles)) return storageClasses;

    return getReadyStorageClasses(storageClasses, storageProfiles);
  }, [storageClasses, storageProfiles, scLoaded, spLoaded]);

  const sortedStorageClasses = useMemo(
    () => readyStorageClasses?.map(getName)?.sort(),
    [readyStorageClasses],
  );

  const loaded = scLoaded && spLoaded;

  return [{ readyStorageClasses, sortedStorageClasses }, loaded];
};

export default useReadyStorageClasses;
