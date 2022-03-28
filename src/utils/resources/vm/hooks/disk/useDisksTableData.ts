import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  PersistentVolumeClaimModel,
  VirtualMachineInstanceModelGroupVersionKind,
} from '@kubevirt-utils/models';
import { DiskRawData, DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getDisks, getVolumes } from '../../utils';
import { getDiskRowDataLayout } from '../../utils/disk/rowData';

type UseDisksTableDisks = (vm: V1VirtualMachine) => [DiskRowDataLayout[], boolean, any];

/**
 * A Hook for getting disks data for a VM
 * @param vm - virtual machine to get disks from
 * @returns disks data and loading state
 */
const useDisksTableData: UseDisksTableDisks = (vm: V1VirtualMachine) => {
  const { t } = useKubevirtTranslation();
  // to get hotplug data, we need to get the raw data from the VMI
  const [vmi] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    name: vm?.metadata?.name,
    namespace: vm?.metadata?.namespace,
  });
  const vmDisks = React.useMemo(
    () => (!vmi ? getDisks(vm) : vmi?.spec?.domain?.devices?.disks),
    [vm, vmi],
  );
  const vmVolumes = React.useMemo(() => (!vmi ? getVolumes(vm) : vmi?.spec?.volumes), [vm, vmi]);

  const [pvcs, loaded, loadingError] = useK8sWatchResource<K8sResourceCommon[]>({
    kind: PersistentVolumeClaimModel.kind,
    isList: true,
    namespaced: true,
    namespace: vm?.metadata?.namespace,
  });

  const disks = React.useMemo(() => {
    const diskDevices: DiskRawData[] = (vmVolumes || []).map((volume) => {
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
