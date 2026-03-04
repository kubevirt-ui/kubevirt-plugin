import { useMemo } from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  DataVolumeModel,
  modelToGroupVersionKind,
  VirtualMachineModel,
} from '@kubevirt-utils/models';
import { findOwnerRefByKind } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UsePVCOwnerVMName = (
  pvc: IoK8sApiCoreV1PersistentVolumeClaim,
  namespace: string,
  cluster?: string,
) => string | undefined;

export const usePVCOwnerVMName: UsePVCOwnerVMName = (pvc, namespace, cluster) => {
  const directVMOwner = useMemo(() => findOwnerRefByKind(pvc, VirtualMachineModel.kind), [pvc]);
  const dvOwnerName = useMemo(() => findOwnerRefByKind(pvc, DataVolumeModel.kind), [pvc]);

  const watchDV = useMemo(
    () =>
      dvOwnerName && !directVMOwner
        ? {
            cluster,
            groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
            isList: false,
            name: dvOwnerName,
            namespace,
          }
        : null,
    [cluster, directVMOwner, dvOwnerName, namespace],
  );

  const [dataVolume] = useK8sWatchData<V1beta1DataVolume>(watchDV);

  return useMemo(() => {
    if (directVMOwner) return directVMOwner;
    if (dataVolume) return findOwnerRefByKind(dataVolume, VirtualMachineModel.kind);
    return undefined;
  }, [directVMOwner, dataVolume]);
};
