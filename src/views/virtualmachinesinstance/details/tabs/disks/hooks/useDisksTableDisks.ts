import * as React from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import {
  DiskPresentation,
  DiskRaw,
  diskStructureCreator,
} from './../utils/virtualMachinesInstancePageDisksTabUtils';

type UseDisksTableDisks = (vmi: V1VirtualMachineInstance) => [DiskPresentation[], boolean, any];

const useDisksTableDisks: UseDisksTableDisks = (vmi) => {
  const vmiDisks = vmi?.spec?.domain?.devices?.disks;
  const vmiVolumes = vmi?.spec?.volumes;

  const [pvcs, loaded, loadingError] = useK8sWatchResource<K8sResourceCommon[]>({
    kind: PersistentVolumeClaimModel.kind,
    isList: true,
    namespaced: true,
    namespace: vmi?.metadata?.namespace,
  });

  const disks = React.useMemo(() => {
    const diskDevices: DiskRaw[] = vmiVolumes?.map((volume) => {
      const disk = vmiDisks?.find(({ name }) => name === volume.name);
      const pvc = pvcs?.find(
        ({ metadata }) =>
          metadata.name === volume?.persistentVolumeClaim?.claimName ||
          metadata.name === volume?.dataVolume?.name,
      );
      return { ...disk, pvc };
    });

    return diskStructureCreator(diskDevices);
  }, [pvcs, vmiDisks, vmiVolumes]);

  return [disks || [], loaded, loadingError];
};
export default useDisksTableDisks;
