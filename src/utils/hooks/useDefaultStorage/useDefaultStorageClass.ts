import { useMemo } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { StorageClassModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { isEmpty } from '../../utils/utils';

import {
  DEFAULT_STORAGE_CLASS_ANNOTATION,
  DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION,
} from './constants';

type UseDefaultStorageClass = (cluster?: string) => [
  {
    clusterDefaultStorageClass: IoK8sApiStorageV1StorageClass;
    sortedStorageClasses: string[];
    storageClasses: IoK8sApiStorageV1StorageClass[];
    virtDefaultStorageClass: IoK8sApiStorageV1StorageClass;
  },
  boolean,
];

const useDefaultStorageClass: UseDefaultStorageClass = (cluster) => {
  const clusterParam = useClusterParam();

  const [storageClasses, loaded] = useK8sWatchData<IoK8sApiStorageV1StorageClass[]>({
    cluster: cluster || clusterParam,
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const defaultStorageClass = useMemo(() => {
    const defaultSC = { clusterDefaultStorageClass: null, virtDefaultStorageClass: null };
    if (!loaded || isEmpty(storageClasses)) return defaultSC;

    return storageClasses?.reduce((acc, sc) => {
      const annotations = sc?.metadata?.annotations;

      if (annotations?.[DEFAULT_STORAGE_CLASS_ANNOTATION] === 'true')
        acc.clusterDefaultStorageClass = sc;

      if (annotations?.[DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION] === 'true')
        acc.virtDefaultStorageClass = sc;

      return acc;
    }, defaultSC);
  }, [storageClasses, loaded]);

  const sortedStorageClasses = useMemo(
    () => storageClasses?.map(getName)?.sort(),
    [storageClasses],
  );

  return [{ ...defaultStorageClass, sortedStorageClasses, storageClasses }, loaded];
};

export default useDefaultStorageClass;
