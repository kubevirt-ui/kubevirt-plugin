import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  CONTAINER_EPHERMAL,
  DYNAMIC,
  OTHER,
} from '@kubevirt-utils/components/DiskModal/components/utils/constants';
import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { DiskRawData, DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import {
  getPrintableDiskDrive,
  getPrintableDiskInterface,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { NO_DATA_DASH } from '../constants';

/**
 *  A function for getting disks row data for a VM
 * @param {DiskRawData[]} disks - disks to get row data from
 * @param {V1Disk} bootDisk - the current boot disk of the vm
 * @returns returns DiskRowDataLayout[]
 */
export const getDiskRowDataLayout = (
  disks: DiskRawData[],
  bootDisk: V1Disk,
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
      source: OTHER,
      storageClass: NO_DATA_DASH,
    };

    if (device?.pvc) {
      diskRowDataObject.source = device?.pvc?.metadata?.name;
      diskRowDataObject.sourceStatus = device?.pvc?.status?.phase;
      diskRowDataObject.size = humanizeBinaryBytes(
        convertToBaseValue(device?.pvc?.spec?.resources?.requests?.storage),
      ).string;
      diskRowDataObject.storageClass = device?.pvc?.spec?.storageClassName;
    }

    if (volumeSource === SourceTypes.EPHEMERAL) {
      diskRowDataObject.source = CONTAINER_EPHERMAL;
      diskRowDataObject.size = DYNAMIC;
    }

    return diskRowDataObject;
  });
};
