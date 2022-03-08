import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { DiskRawData, DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getDiskRowDataLayout } from '../../utils/disk/rowData';

type UseDisksTableDisks = (vm: V1VirtualMachine) => [DiskRowDataLayout[], boolean, any];

const useDisksTableData: UseDisksTableDisks = (vm: V1VirtualMachine) => {
  const { t } = useKubevirtTranslation();
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

    return getDiskRowDataLayout(diskDevices, t);
  }, [pvcs, vmDisks, vmVolumes, t]);

  return [disks || [], loaded, loadingError];
};

export default useDisksTableData;
