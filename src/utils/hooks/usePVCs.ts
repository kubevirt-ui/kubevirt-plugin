import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UsePVCs = (
  namespace: string,
  cluster?: string,
) => [IoK8sApiCoreV1PersistentVolumeClaim[], boolean, any];

const usePVCs: UsePVCs = (namespace, cluster) => {
  const pvcWathcResource = namespace
    ? {
        cluster,
        groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
        isList: true,
        namespace,
        namespaced: true,
      }
    : null;

  const [pvcsUnsorted, loaded, error] =
    useK8sWatchData<IoK8sApiCoreV1PersistentVolumeClaim[]>(pvcWathcResource);

  const pvcs = useMemo(
    () => (pvcsUnsorted || [])?.sort((a, b) => a?.metadata?.name?.localeCompare(b?.metadata?.name)),
    [pvcsUnsorted],
  );

  return [pvcs, loaded, error];
};

export default usePVCs;
