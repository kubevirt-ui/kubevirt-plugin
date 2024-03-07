import { useMemo } from 'react';
import { isRunning } from 'src/views/virtualmachines/utils';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getRunningVMMissingDisksFromVMI,
  getRunningVMMissingVolumesFromVMI,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { DiskRawData, DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getBootDisk, getDisks, getVolumes } from '../../utils';
import { getDiskRowDataLayout } from '../../utils/disk/rowData';

type UseDisksTableDisks = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
) => [DiskRowDataLayout[], boolean, any, V1VirtualMachineInstance];

/**
 * A Hook for getting disks data for a VM
 * @param vm - virtual machine to get disks from
 * @param vmi - virtual machine instance
 * @returns disks data and loading state
 */
const useDisksTableData: UseDisksTableDisks = (vm, vmi) => {
  const isVMRunning = isRunning(vm);
  const vmDisks = useMemo(
    () =>
      !isVMRunning
        ? getDisks(vm)
        : [...(getDisks(vm) || []), ...getRunningVMMissingDisksFromVMI(getDisks(vm) || [], vmi)],
    [vm, vmi, isVMRunning],
  );
  const vmVolumes = useMemo(
    () =>
      !isVMRunning
        ? getVolumes(vm)
        : [
            ...(getVolumes(vm) || []),
            ...getRunningVMMissingVolumesFromVMI(getVolumes(vm) || [], vmi),
          ],
    [vm, vmi, isVMRunning],
  );

  const [pvcs, loaded, loadingError] = useK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim[]>({
    isList: true,
    kind: PersistentVolumeClaimModel.kind,
    namespace: vm?.metadata?.namespace,
    namespaced: true,
  });

  const disks = useMemo(() => {
    const diskDevices: DiskRawData[] = (vmVolumes || []).map((volume) => {
      const disk = vmDisks?.find(({ name }) => name === volume?.name);
      const pvc = pvcs?.find(
        ({ metadata }) =>
          metadata?.name === volume?.persistentVolumeClaim?.claimName ||
          metadata?.name === volume?.dataVolume?.name,
      );
      return { disk, pvc, volume };
    });

    return getDiskRowDataLayout(diskDevices, getBootDisk(vm));
  }, [vmVolumes, vm, vmDisks, pvcs]);

  return [disks || [], loaded, loadingError, isVMRunning ? vmi : null];
};

export default useDisksTableData;
