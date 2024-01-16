import { useMemo } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { StorageClassModel } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { isEmpty } from '../../utils/utils';

import {
  DEFAULT_STORAGE_CLASS_ANNOTATION,
  DEFAULT_VIRT_STORAGE_CLASS_ANNOTATION,
} from './constants';

type UseDefaultStorageClass = () => [
  {
    clusterDefaultStorageClass: IoK8sApiStorageV1StorageClass;
    storageClasses: IoK8sApiStorageV1StorageClass[];
    virtDefaultStorageClass: IoK8sApiStorageV1StorageClass;
  },
  boolean,
];

const useDefaultStorageClass: UseDefaultStorageClass = () => {
  const [storageClasses, loaded] = useK8sWatchResource<IoK8sApiStorageV1StorageClass[]>({
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
  return [{ ...defaultStorageClass, storageClasses }, loaded];
};

export default useDefaultStorageClass;
