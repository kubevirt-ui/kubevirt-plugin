import { useMemo } from 'react';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useStorageClasses from '@kubevirt-utils/hooks/useStorageClasses/useStorageClasses';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { isEmpty } from '../../utils/utils';

import { isDefaultStorageClass, isVirtDefaultStorageClass } from './utils';

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
      if (isDefaultStorageClass(sc)) acc.clusterDefaultStorageClass = sc;

      if (isVirtDefaultStorageClass(sc)) acc.virtDefaultStorageClass = sc;

      return acc;
    }, defaultSC);
  }, [storageClasses, loaded]);

  return [defaultStorageClass, loaded];
};

export default useDefaultStorageClass;
