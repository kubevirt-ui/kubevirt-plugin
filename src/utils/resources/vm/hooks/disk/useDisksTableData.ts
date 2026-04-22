import { useMemo } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getRunningVMMissingDisksFromVMI,
  getRunningVMMissingVolumesFromVMI,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { getName } from '@kubevirt-utils/resources/shared';
import { DiskRawData, DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { isRunning } from '@virtualmachines/utils';

import { getBootDisk, getDataVolumeTemplates, getDisks, getVolumes } from '../../utils';
import { getDiskRowDataLayout } from '../../utils/disk/rowData';

import useDisksSources from './useDisksSources';
import { enrichDisksWithVMIBusInfo, getEjectedCDROMDrives, isStorageVolume } from './utils';

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
  const { dvs, loaded, loadingError, pvcs } = useDisksSources(vm);
  const isVMRunning = isRunning(vm);

  const vmDisks = useMemo(() => {
    const vmDiskList = getDisks(vm) || [];
    if (!isVMRunning) return vmDiskList;

    const enrichedDisks = vmi ? enrichDisksWithVMIBusInfo(vmDiskList, vmi) : vmDiskList;
    const missingDisks = getRunningVMMissingDisksFromVMI(vmDiskList, vmi);

    return [...enrichedDisks, ...missingDisks];
  }, [vm, vmi, isVMRunning]);

  const vmVolumes = useMemo(() => {
    const detectedVolumes = !isVMRunning
      ? getVolumes(vm)
      : [
          ...(getVolumes(vm) || []),
          ...getRunningVMMissingVolumesFromVMI(getVolumes(vm) || [], vmi),
        ];

    return detectedVolumes?.filter(isStorageVolume);
  }, [vm, vmi, isVMRunning]);

  const disks = useMemo(() => {
    const diskDevices: DiskRawData[] = (vmVolumes || []).map((volume) => {
      let disk = vmDisks?.find(({ name }) => name === volume?.name);

      if (!disk) disk = { name: volume?.name };

      const dataVolumeTemplate = volume?.dataVolume?.name
        ? getDataVolumeTemplates(vm)?.find((dv) => getName(dv) === volume.dataVolume.name)
        : null;

      const pvc = pvcs?.find(
        ({ metadata }) =>
          metadata?.name === volume?.persistentVolumeClaim?.claimName ||
          metadata?.name === volume?.dataVolume?.name,
      );

      const dataVolume = dvs?.find(
        ({ metadata }) =>
          metadata?.name === volume?.persistentVolumeClaim?.claimName ||
          metadata?.name === volume?.dataVolume?.name,
      );

      return { dataVolume, dataVolumeTemplate, disk, pvc, volume };
    });

    const ejectedCDROMDrives = getEjectedCDROMDrives(diskDevices, vmDisks);
    const combinedDevices = [...ejectedCDROMDrives, ...diskDevices];

    return getDiskRowDataLayout(combinedDevices, getBootDisk(vm));
  }, [dvs, vm, vmVolumes, vmDisks, pvcs]);

  return [disks || [], loaded, loadingError, isVMRunning ? vmi : null];
};

export default useDisksTableData;
