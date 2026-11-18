import {
  type V1Disk,
  type V1VirtualMachine,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { produceVMDisks } from '@kubevirt-utils/components/DiskModal/utils/vmProducers';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { getBootDisk, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import {
  hasContainerDisk,
  hasDataVolume,
  hasPersistentVolumeClaim,
  isCDROMDisk,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { getIsoCdromDiskName } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/bootVolumeNames';

import {
  addBlankInstallDisk,
  allocateUnusedName,
  getStorageClassNameForDisk,
  getUsedDiskAndVolumeNames,
} from './isoCdromBlankDisk';
import { assignUniqueBootOrder } from './isoCdromBootOrder';

const isInstallableSystemVolume = (volume?: V1Volume): boolean =>
  Boolean(
    volume &&
    (hasDataVolume(volume) || hasPersistentVolumeClaim(volume) || hasContainerDisk(volume)),
  );

/** True when converting this disk leaves the VM without an installable system disk. */
export const requiresBlankInstallDisk = (vm: V1VirtualMachine, diskName: string): boolean => {
  const isBootDisk = getBootDisk(vm)?.name === diskName;
  const volumes = getVolumes(vm) ?? [];
  const hasOtherInstallDisk = (getDisks(vm) ?? []).some((disk) => {
    if (disk.name === diskName || isCDROMDisk(disk)) {
      return false;
    }

    const volume = volumes.find((item) => item.name === disk.name);
    return isInstallableSystemVolume(volume);
  });

  return isBootDisk || !hasOtherInstallDisk;
};

const convertDiskToCdrom = (disk: V1Disk): void => {
  delete disk.disk;
  delete disk.lun;
  delete disk.dedicatedIOThread;
  disk.cdrom = { bus: InterfaceTypes.SATA };
};

const findInstallableSystemDisk = (
  draftVM: V1VirtualMachine,
  excludeDiskName: string,
): V1Disk | undefined => {
  const volumes = getVolumes(draftVM) ?? [];
  const disks = getDisks(draftVM) ?? [];
  const bootDiskName = getBootDisk(draftVM)?.name;

  const installableDisks = disks.filter((disk) => {
    if (disk.name === excludeDiskName || isCDROMDisk(disk)) {
      return false;
    }
    const volume = volumes.find((item) => item.name === disk.name);
    return isInstallableSystemVolume(volume);
  });

  return installableDisks.find((disk) => disk.name === bootDiskName) ?? installableDisks[0];
};

export const produceUseAsIsoVM = (
  vm: V1VirtualMachine,
  diskName: string,
  systemDiskSize: string,
): V1VirtualMachine => {
  const needsBlank = requiresBlankInstallDisk(vm, diskName);
  const storageClassName = getStorageClassNameForDisk(vm, diskName);
  const vmName = getName(vm);

  return produceVMDisks(vm, (draftVM) => {
    const disks = getDisks(draftVM) ?? [];
    const volumes = getVolumes(draftVM) ?? [];
    const disk = disks.find((item) => item.name === diskName);
    const volume = volumes.find((item) => item.name === diskName);

    if (!disk || !volume || isCDROMDisk(disk)) {
      return;
    }

    let cdromDiskName = diskName;
    if (needsBlank && diskName === ROOTDISK) {
      const usedNames = getUsedDiskAndVolumeNames(draftVM);
      usedNames.delete(diskName);
      cdromDiskName = allocateUnusedName(getIsoCdromDiskName(vmName), usedNames);
      disk.name = cdromDiskName;
      volume.name = cdromDiskName;
    }

    convertDiskToCdrom(disk);

    if (!needsBlank) {
      const systemDisk = findInstallableSystemDisk(draftVM, cdromDiskName);
      // Once any bootOrder is set, disks without one are excluded from boot.
      if (systemDisk && systemDisk.bootOrder == null) {
        assignUniqueBootOrder(draftVM, systemDisk.name, 1);
      }
      assignUniqueBootOrder(draftVM, cdromDiskName, 2);
      return;
    }

    const blankDiskName = addBlankInstallDisk(draftVM, vmName, systemDiskSize, storageClassName);
    assignUniqueBootOrder(draftVM, blankDiskName, 1);
    assignUniqueBootOrder(draftVM, cdromDiskName, 2);
  });
};
