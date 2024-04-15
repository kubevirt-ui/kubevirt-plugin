import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';

import { diskTypes, diskTypesLabels } from './constants';

/**
 * returns a drive type from a disk
 * @param {V1Disk} disk disk
 * @returns drive type
 */
export const getDiskDrive = (disk: V1Disk): string => {
  const drive = Object.keys(diskTypesLabels).find((driveType: string) => disk?.[driveType]);
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
