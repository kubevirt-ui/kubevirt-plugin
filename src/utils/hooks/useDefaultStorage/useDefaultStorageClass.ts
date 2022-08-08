import { useMemo } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { StorageClassModel } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { isEmpty } from '../../utils/utils';

import { DEFAULT_STORAGE_CLASS_ANNOTATION } from './constants';

type UseDefaultStorageClass = () => [IoK8sApiStorageV1StorageClass, boolean];

const useDefaultStorageClass: UseDefaultStorageClass = () => {
  const [storageClasses, loaded] = useK8sWatchResource<IoK8sApiStorageV1StorageClass[]>({
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const defaultStorageClass = useMemo(() => {
    if (!loaded || isEmpty(storageClasses)) return null;

    return storageClasses?.find(
      ({ metadata }) => metadata?.annotations?.[DEFAULT_STORAGE_CLASS_ANNOTATION] === 'true',
    );
  }, [storageClasses, loaded]);
  return [defaultStorageClass, loaded];
};

export default useDefaultStorageClass;
