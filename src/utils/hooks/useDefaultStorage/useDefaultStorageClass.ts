import { useMemo } from 'react';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useStorageClasses from '@kubevirt-utils/hooks/useStorageClasses/useStorageClasses';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { isEmpty } from '../../utils/utils';

import {
  DEFAULT_STORAGE_CLASS_ANNOTATION,
  DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION,
} from './constants';

type UseDefaultStorageClass = (cluster?: string) => [
  {
    clusterDefaultStorageClass: IoK8sApiStorageV1StorageClass;
    virtDefaultStorageClass: IoK8sApiStorageV1StorageClass;
  },
  boolean,
];

const useDefaultStorageClass: UseDefaultStorageClass = (cluster) => {
  const clusterParam = useClusterParam();
  const resolvedCluster = cluster || clusterParam;
  const [storageClasses, loaded] = useStorageClasses(resolvedCluster);

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

  return [defaultStorageClass, loaded];
};

export default useDefaultStorageClass;
