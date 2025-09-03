import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DiskType, diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';

export const getDiskTypeHelperText = (diskType: DiskType, isVMRunning: boolean): string => {
  if (diskType === diskTypes.cdrom)
    return t('CD-ROM type is automatically set and cannot be changed');

  if (isVMRunning) return t('Hot plug is enabled only for Disk and LUN types');
  return '';
};

export const getInterfaceTypeHelperText = (diskType: DiskType, isVMRunning: boolean): string => {
  if (diskType === diskTypes.lun) return t('LUN disks require SCSI interfaces');

  if (isVMRunning) return t('Hot plug is enabled only for SCSI and VirtIO interfaces');
  return '';
};
