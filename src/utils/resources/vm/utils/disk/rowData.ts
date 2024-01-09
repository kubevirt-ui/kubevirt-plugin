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
import { isEmpty } from '@kubevirt-utils/utils/utils';

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
      drive: isEmpty(device?.disk) ? NO_DATA_DASH : getPrintableDiskDrive(device?.disk),
      interface: isEmpty(device?.disk) ? NO_DATA_DASH : getPrintableDiskInterface(device?.disk),
      isBootDisk: device?.disk?.name === bootDisk?.name,
      isEnvDisk:
        !!device?.volume?.configMap || !!device?.volume?.secret || !!device?.volume?.serviceAccount,
      metadata: { name: device?.volume?.name },
      name: device?.volume?.name,
      namespace: device?.pvc?.metadata?.namespace,
      size: NO_DATA_DASH,
      source: t(OTHER),
      storageClass: NO_DATA_DASH,
    };

    if (device?.pvc) {
      diskRowDataObject.source = device?.pvc?.metadata?.name;
      diskRowDataObject.sourceStatus = device?.pvc?.status?.phase;
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
