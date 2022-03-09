import { TFunction } from 'i18next';

import { DiskRawData, DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import {
  getPrintableDiskDrive,
  getPrintableDiskInterface,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';

/**
 *  A function for getting disks row data for a VM
 * @param {DiskRawData[]} disks - disks to get row data from
 * @param {TFunction} t - T function for i18n
 * @returns returns DiskRowDataLayout[]
 */
export const getDiskRowDataLayout = (disks: DiskRawData[], t: TFunction): DiskRowDataLayout[] => {
  return disks?.map((device) => {
    // eslint-disable-next-line require-jsdoc
    const source = () => {
      if (device?.volume?.containerDisk) {
        return t('Container (Ephemeral)');
      }
      const sourceName = device?.pvc?.metadata?.name || t('Other');
      return sourceName;
    };

    const size = device?.volume?.containerDisk
      ? t('Dynamic')
      : formatBytes(device?.pvc?.spec?.resources?.requests?.storage);

    const storageClass = device?.pvc?.spec?.storageClassName || '-';

    return {
      name: device?.disk?.name,
      source: source(),
      size,
      storageClass,
      interface: getPrintableDiskInterface(device?.disk),
      drive: getPrintableDiskDrive(device?.disk),
      metadata: { name: device?.disk?.name },
      namespace: device?.pvc?.metadata?.namespace,
    };
  });
};
