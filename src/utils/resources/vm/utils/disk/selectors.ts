import {
  V1Disk,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { isRunning } from '@virtualmachines/utils';

import { DiskType, diskTypes, diskTypesLabels } from './constants';

/**
 * returns a drive type from a disk
 * @param {V1Disk} disk disk
 * @returns drive type
 */
export const getDiskDrive = (disk: V1Disk): DiskType => {
  const drive = Object.keys(diskTypesLabels).find(
    (driveType: string) => disk?.[driveType],
  ) as DiskType;

  return drive ?? diskTypes.disk;
};

/**
 * returns a printable drive type from a disk
 * @param {V1Disk} disk disk
 * @returns drive type
 */
export const getPrintableDiskDrive = (disk: V1Disk): string => diskTypesLabels[getDiskDrive(disk)];

/**
 * returns a drive interface from a disk
 * @param {V1Disk} disk disk
 * @returns drive interface
 */
export const getDiskInterface = (disk: V1Disk): string => disk?.[getDiskDrive(disk)]?.bus;

/**
 * returns a printable drive interface from a disk
 * @param {V1Disk} disk disk
 * @returns drive interface
 */
export const getPrintableDiskInterface = (disk: V1Disk): string => {
  const diskInterface = getDiskInterface(disk);
  if (diskInterface === InterfaceTypes.SCSI || diskInterface === InterfaceTypes.SATA) {
    return diskInterface.toUpperCase();
  }
  return diskInterface ?? '';
};

export const isCDROMDisk = (disk: V1Disk): boolean => {
  return getDiskDrive(disk) === diskTypes.cdrom;
};

export const isCDROMMounted = (volume: V1Volume): boolean => {
  return !!(
    volume?.containerDisk?.image ||
    volume?.dataVolume?.name ||
    volume?.persistentVolumeClaim?.claimName
  );
};

export const getCDROMSourceName = (volume: V1Volume): string => {
  return (
    volume?.dataVolume?.name ||
    volume?.persistentVolumeClaim?.claimName ||
    volume?.containerDisk?.image ||
    ''
  );
};

export const getCDROMStatus = (vm: V1VirtualMachine, vmi?: V1VirtualMachineInstance) => {
  const disks = getDisks(vm) || [];
  const cdroms = disks.filter(isCDROMDisk);
  const isVMRunning = isRunning(vm);
  const volumes = isVMRunning ? vmi?.spec?.volumes : getVolumes(vm);

  return cdroms.map((disk) => {
    const volume = volumes?.find((v) => v.name === disk.name);
    const isMounted = volume ? isCDROMMounted(volume) : false;

    return {
      canDelete: !isVMRunning,
      canEject: isVMRunning && isMounted,
      canMount: isVMRunning && !isMounted,
      disk,
      isMounted,
      name: disk.name,
      sourceName: isMounted ? getCDROMSourceName(volume) : null,
      volume,
    };
  });
};
