import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';

export const getDiskTypeHelperText = (disk: any, isVMRunning: boolean): string => {
  if (getDiskDrive(disk) === diskTypes.cdrom)
    return t('CD-ROM type is automatically set and cannot be changed');

  if (isVMRunning) return t('Hot plug is enabled only for Disk and LUN types');
  return '';
};

export const getInterfaceTypeHelperText = (disk: any, isVMRunning: boolean): string => {
  if (getDiskDrive(disk) === diskTypes.lun) return t('LUN disks require SCSI interfaces');

  if (isVMRunning) return t('Hot plug is enabled only for SCSI and VirtIO interfaces');
  return '';
};
