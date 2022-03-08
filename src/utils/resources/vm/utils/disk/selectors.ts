import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { diskTypes } from './constants';

export const getDiskDrive = (disk: V1Disk): string => {
  const drive = Object.keys(diskTypes).find((driveType: string) => disk[driveType] ?? 'disk');
  return drive;
};

export const getPrintableDiskDrive = (disk: V1Disk): string => diskTypes[getDiskDrive(disk)];

export const getDiskInterface = (disk: V1Disk): string => disk[getDiskDrive(disk)]?.bus;

export const getPrintableDiskInterface = (disk: V1Disk): string => {
  const diskInterface = getDiskInterface(disk);
  return diskInterface === 'virtio'
    ? diskInterface
    : diskInterface === 'scsi' || diskInterface === 'sata'
    ? diskInterface.toUpperCase()
    : '';
};
