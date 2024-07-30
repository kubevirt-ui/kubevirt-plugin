import { useMemo } from 'react';
import { isRunning } from 'src/views/virtualmachines/utils';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getRunningVMMissingDisksFromVMI,
  getRunningVMMissingVolumesFromVMI,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { DiskRawData, DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';

import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getInstanceTypeMatcher,
  getVolumes,
} from '../../utils';
import { getDiskRowDataLayout } from '../../utils/disk/rowData';

import useDisksSources from './useDisksSources';

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

  const { dataSources, loaded, loadingError, pvcs } = useDisksSources(vm);

  const disks = useMemo(() => {
    const isInstanceTypeVM = Boolean(getInstanceTypeMatcher(vm));

    const diskDevices: DiskRawData[] = (vmVolumes || []).map((volume) => {
      let disk = vmDisks?.find(({ name }) => name === volume?.name);

      if (!disk && isInstanceTypeVM) disk = { name: volume?.name };

      const dataVolumeTemplate = volume?.dataVolume?.name
        ? getDataVolumeTemplates(vm)?.find((dv) => getName(dv) === volume.dataVolume.name)
        : null;

      const sourceRef = dataVolumeTemplate?.spec?.sourceRef;

      const dataSource = dataSources.find(
        (ds) => getName(ds) === sourceRef?.name && getNamespace(ds) === sourceRef?.namespace,
      );

      const pvc = pvcs?.find(
        ({ metadata }) =>
          metadata?.name === volume?.persistentVolumeClaim?.claimName ||
          metadata?.name === volume?.dataVolume?.name ||
          (dataSource?.spec?.source?.pvc?.name === metadata?.name &&
            dataSource?.spec?.source?.pvc?.namespace === metadata?.namespace),
      );

      return { dataVolumeTemplate, disk, pvc, volume };
    });

    return getDiskRowDataLayout(diskDevices, getBootDisk(vm));
  }, [vm, vmVolumes, vmDisks, pvcs, dataSources]);

  return [disks || [], loaded, loadingError, isVMRunning ? vmi : null];
};

export default useDisksTableData;
