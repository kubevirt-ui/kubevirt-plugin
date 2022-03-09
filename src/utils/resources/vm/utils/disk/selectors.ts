import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { diskTypes } from './constants';

/**
 * returns a drive type from a disk
 * @param {V1Disk} disk disk
 * @returns drive type
 */
export const getDiskDrive = (disk: V1Disk): string => {
  const drive = Object.keys(diskTypes).find((driveType: string) => disk[driveType] ?? 'disk');
  return drive;
};

/**
 * returns a printable drive type from a disk
 * @param {V1Disk} disk disk
 * @returns drive type
 */
export const getPrintableDiskDrive = (disk: V1Disk): string => diskTypes[getDiskDrive(disk)];

/**
 * returns a drive interface from a disk
 * @param {V1Disk} disk disk
 * @returns drive interface
 */
export const getDiskInterface = (disk: V1Disk): string => disk[getDiskDrive(disk)]?.bus;

/**
 * returns a printable drive interface from a disk
 * @param {V1Disk} disk disk
 * @returns drive interface
 */
export const getPrintableDiskInterface = (disk: V1Disk): string => {
  const diskInterface = getDiskInterface(disk);
  if (diskInterface === 'scsi' || diskInterface === 'sata') {
    return diskInterface.toUpperCase();
  }
  return diskInterface ?? '';
};
