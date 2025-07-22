import { useCallback, useEffect } from 'react';
import { Updater } from 'use-immer';

import { IoK8sApiCoreV1PersistentVolumeClaim, V1beta1StorageMap } from '@kubev2v/types';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  StorageClassModel,
} from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { getInitialStorageMap } from '../utils';

import useProviderStorageClasses from './useProviderStorageClasses';

export type UseStorageReadinessReturnType = {
  changeStorageMap: (storageClassName: string, destinationStorageClassName: string) => void;
  error: any;
  isReady: boolean;
  loaded: boolean;
  storageMap: V1beta1StorageMap;
  targetStorageClasses: IoK8sApiStorageV1StorageClass[];
};

const useStorageReadiness = (
  vms: V1VirtualMachine[],
  targetProvider: string,
  storageMap: V1beta1StorageMap,
  setStorageMap: Updater<V1beta1StorageMap>,
) => {
  const sourceCluster = getCluster(vms?.[0]);
  const sourceNamespace = getNamespace(vms?.[0]);

  const [sourceStorageClasses, sourceStorageClassesLoaded, sourceStorageClassesError] =
    useK8sWatchData<IoK8sApiStorageV1StorageClass[]>({
      cluster: sourceCluster,
      groupVersionKind: modelToGroupVersionKind(StorageClassModel),
      isList: true,
    });

  const {
    data: targetStorageClasses,
    error: targetStorageClassesError,
    loaded: targetStorageClassesLoaded,
  } = useProviderStorageClasses(targetProvider);

  const [pvcs, pvcsLoaded, pvcsError] = useK8sWatchData<IoK8sApiCoreV1PersistentVolumeClaim[]>({
    cluster: sourceCluster,
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    namespace: sourceNamespace,
  });

  useEffect(() => {
    if (
      sourceStorageClassesLoaded &&
      pvcsLoaded &&
      targetStorageClassesLoaded &&
      storageMap === null
    ) {
      setStorageMap(
        getInitialStorageMap({ pvcs, sourceStorageClasses, targetStorageClasses, vms }),
      );
    }
  }, [
    pvcs,
    pvcsLoaded,
    setStorageMap,
    sourceStorageClasses,
    sourceStorageClassesLoaded,
    targetStorageClassesLoaded,
    targetStorageClasses,
    storageMap,
    vms,
  ]);

  const changeStorageMap = useCallback(
    (storageClassName: string, destinationStorageClassName: string) => {
      setStorageMap((draft) => {
        const storageMapItem = draft.spec.map.find((map) => map.source.name === storageClassName);
        if (storageMapItem) {
          storageMapItem.destination.storageClass = destinationStorageClassName;
        }
      });
    },
    [setStorageMap],
  );

  const error = sourceStorageClassesError || targetStorageClassesError || pvcsError;
  const loaded =
    (sourceStorageClassesLoaded && pvcsLoaded && targetStorageClassesLoaded) || !isEmpty(error);

  return {
    changeStorageMap,
    error,
    isReady: storageMap?.spec?.map?.every((map) => map.destination.storageClass),
    loaded,
    storageMap,
    targetStorageClasses,
  };
};

export default useStorageReadiness;
