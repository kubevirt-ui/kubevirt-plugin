import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils/constants';
import { convertIntoPVCMapper } from '@virtualmachines/utils/mappers';

export const usePVCMapper = (namespace: string, cluster?: string) => {
  const [pvcs] = useK8sWatchData<IoK8sApiCoreV1PersistentVolumeClaim[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespace,
    namespaced: true,
  });

  const pvcMapper = useMemo(() => convertIntoPVCMapper(pvcs), [pvcs]);

  return pvcMapper;
};
