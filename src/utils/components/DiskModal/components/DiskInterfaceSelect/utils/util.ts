import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';

export const getDiskTypeHelperText = (disk: any, isVMRunning: boolean): string => {
  if (getDiskDrive(disk) === diskTypes.cdrom)
    return 'CD-ROM type is automatically set and cannot be changed';
  if (isVMRunning) return 'Hot plug is enabled only for Disk and LUN types';
  return '';
};

export const getInterfaceTypeHelperText = (disk: any, isVMRunning: boolean): string => {
  if (getDiskDrive(disk) === diskTypes.lun) return 'LUN disks require SCSI interface';
  if (isVMRunning) return 'Hot plug is enabled only for SCSI and VirtIO interface';
  return '';
};
