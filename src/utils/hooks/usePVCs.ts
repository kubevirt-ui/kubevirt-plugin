import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UsePVCs = (namespace: string) => [IoK8sApiCoreV1PersistentVolumeClaim[], boolean, any];

const usePVCs: UsePVCs = (namespace: string) => {
  const pvcWathcResource = namespace
    ? {
        groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
        isList: true,
        namespace,
        namespaced: true,
      }
    : null;

  const [pvcsUnsorted, loaded, error] =
    useK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim[]>(pvcWathcResource);

  const pvcs = useMemo(
    () => (pvcsUnsorted || [])?.sort((a, b) => a?.metadata?.name?.localeCompare(b?.metadata?.name)),
    [pvcsUnsorted],
  );

  return [pvcs, loaded, error];
};

export default usePVCs;
