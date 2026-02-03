import {
  V1Disk,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import { DiskType, diskTypes, diskTypesLabels } from './constants';

/**
 * returns a drive type from a disk
 * @param {V1Disk} disk disk
 * @returns drive type
 */
export const getDiskDrive = (disk: V1Disk): DiskType => {
  const drive = Object.values(diskTypes).find((driveType) => disk?.[driveType]);

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

export const getCDROMSourceName = (volume: V1Volume): string => {
  return (
    volume?.dataVolume?.name ||
    volume?.persistentVolumeClaim?.claimName ||
    volume?.containerDisk?.image ||
    ''
  );
};

export const isCDROMMounted = (volume: V1Volume): boolean => {
  return !isEmpty(getCDROMSourceName(volume));
};

export const getCDROMStatus = (vm: V1VirtualMachine, vmi?: V1VirtualMachineInstance) => {
  const isVMRunning = isRunning(vm);
  const disks = (isVMRunning ? vmi?.spec?.domain?.devices?.disks : getDisks(vm)) || [];
  const cdroms = disks.filter(isCDROMDisk);
  const volumes = isVMRunning ? vmi?.spec?.volumes : getVolumes(vm);

  return cdroms.map((disk) => {
    const volume = volumes?.find((vmVolume) => vmVolume.name === disk.name);
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

export const hasDataVolume = (volume: V1Volume): boolean => {
  return !isEmpty(volume?.dataVolume?.name);
};

export const hasPersistentVolumeClaim = (volume: V1Volume): boolean => {
  return !isEmpty(volume?.persistentVolumeClaim?.claimName);
};

export const hasContainerDisk = (volume: V1Volume): boolean => {
  return !isEmpty(volume?.containerDisk?.image);
};

export const getContainerDiskImage = (volume: V1Volume): null | string => {
  return volume?.containerDisk?.image?.toLowerCase() || null;
};
