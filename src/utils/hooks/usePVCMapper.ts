import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils/constants';
import { convertIntoPVCMapper, type PVCMapper } from '@virtualmachines/utils/mappers';

import useKubevirtWatchResource from './useKubevirtWatchResource/useKubevirtWatchResource';

export const usePVCMapper = (namespace: string | undefined, cluster?: string): PVCMapper => {
  const [pvcs] = useKubevirtWatchResource<IoK8sApiCoreV1PersistentVolumeClaim[]>({
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
