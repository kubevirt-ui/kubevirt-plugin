import * as React from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  DiskPresentation,
  DiskRaw,
  diskStructureCreator,
} from './../utils/virtualMachinesInstancePageDisksTabUtils';

type UseDisksTableDisks = (vmi: V1VirtualMachineInstance) => [DiskPresentation[], boolean, any];

const useDisksTableDisks: UseDisksTableDisks = (vmi) => {
  const vmiDisks = vmi?.spec?.domain?.devices?.disks;
  const vmiVolumes = vmi?.spec?.volumes;

  const [pvcs, loaded, loadingError] = useK8sWatchData<K8sResourceCommon[]>({
    cluster: getCluster(vmi),
    isList: true,
    kind: PersistentVolumeClaimModel.kind,
    namespace: getNamespace(vmi),
    namespaced: true,
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
