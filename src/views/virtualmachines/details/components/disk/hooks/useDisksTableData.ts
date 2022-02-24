import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getDisks, getVolumes } from '../../../../utils/selectors';
import {
  DiskRawData,
  DiskRowDataLayout,
  getDiskRowDataLayout,
} from '../utils/VirtualMachineDisksTabUtils';

type UseDisksTableDisks = (vm: V1VirtualMachine) => [DiskRowDataLayout[], boolean, any];

const useDisksTableData: UseDisksTableDisks = (vm: V1VirtualMachine) => {
  const vmDisks = getDisks(vm);
  const vmVolumes = getVolumes(vm);

  const [pvcs, loaded, loadingError] = useK8sWatchResource<K8sResourceCommon[]>({
    kind: PersistentVolumeClaimModel.kind,
    isList: true,
    namespaced: true,
    namespace: vm?.metadata?.namespace,
  });

  const disks = React.useMemo(() => {
    const diskDevices: DiskRawData[] = vmVolumes?.map((volume) => {
      const disk = vmDisks?.find(({ name }) => name === volume?.name);
      const pvc = pvcs?.find(
        ({ metadata }) =>
          metadata?.name === volume?.persistentVolumeClaim?.claimName ||
          metadata?.name === volume?.dataVolume?.name,
      );
      return { disk, volume, pvc };
    });

    return getDiskRowDataLayout(diskDevices);
  }, [pvcs, vmDisks, vmVolumes]);

  return [disks, loaded, loadingError];
};

export default useDisksTableData;
