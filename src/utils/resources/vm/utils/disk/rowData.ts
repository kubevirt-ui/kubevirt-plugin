import { TFunction } from 'i18next';

import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  CONTAINER_EPHERMAL,
  DYNAMIC,
  OTHER,
  sourceTypes,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/constants';
import { DiskRawData, DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import {
  getPrintableDiskDrive,
  getPrintableDiskInterface,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';

import { NO_DATA_DASH } from '../constants';

/**
 *  A function for getting disks row data for a VM
 * @param {DiskRawData[]} disks - disks to get row data from
 * @param {V1Disk} bootDisk - the current boot disk of the vm
 * @param {TFunction} t - T function for i18n
 * @returns returns DiskRowDataLayout[]
 */
export const getDiskRowDataLayout = (
  disks: DiskRawData[],
  bootDisk: V1Disk,
  t: TFunction,
): DiskRowDataLayout[] => {
  return disks?.map((device) => {
    // eslint-disable-next-line require-jsdoc
    const volumeSource = Object.keys(device?.volume).find((key) => key !== 'name');

    const diskRowDataObject: DiskRowDataLayout = {
      name: device?.disk?.name,
      interface: getPrintableDiskInterface(device?.disk),
      drive: getPrintableDiskDrive(device?.disk),
      metadata: { name: device?.disk?.name },
      namespace: device?.pvc?.metadata?.namespace,
      source: t(OTHER),
      size: NO_DATA_DASH,
      storageClass: NO_DATA_DASH,
      isBootDisk: device?.disk?.name === bootDisk?.name,
    };

    if (device?.pvc) {
      diskRowDataObject.source = device?.pvc?.metadata?.name;
      diskRowDataObject.size = formatBytes(device?.pvc?.spec?.resources?.requests?.storage);
      diskRowDataObject.storageClass = device?.pvc?.spec?.storageClassName;
    }

    if (volumeSource === sourceTypes.EPHEMERAL) {
      diskRowDataObject.source = t(CONTAINER_EPHERMAL);
      diskRowDataObject.size = t(DYNAMIC);
    }

    return diskRowDataObject;
  });
};
