import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  CONTAINER_EPHERMAL,
  DYNAMIC,
  OTHER,
} from '@kubevirt-utils/components/DiskModal/components/utils/constants';
import { VolumeTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import {
  getDataVolumeSize,
  getDataVolumeStorageClassName,
  getPhase,
  getPVCSize,
  getPVCStorageClassName,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { DiskRawData, DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import {
  getPrintableDiskDrive,
  getPrintableDiskInterface,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
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
    const { dataVolume, dataVolumeTemplate, disk, pvc, volume } = device;
    // eslint-disable-next-line require-jsdoc
    const volumeSource = Object.keys(volume).find((key) => key !== 'name');

    const diskRowDataObject: DiskRowDataLayout = {
      drive: isEmpty(disk) ? NO_DATA_DASH : getPrintableDiskDrive(disk),
      hasDataVolume: Boolean(dataVolume),
      interface: isEmpty(disk) ? NO_DATA_DASH : getPrintableDiskInterface(disk),
      isBootDisk: disk?.name === bootDisk?.name,
      isEnvDisk: !!volume?.configMap || !!volume?.secret || !!volume?.serviceAccount,
      metadata: { name: volume?.name },
      name: volume?.name,
      namespace: getNamespace(pvc),
      size: NO_DATA_DASH,
      source: OTHER,
      storageClass: dataVolumeTemplate?.spec?.storage?.storageClassName || NO_DATA_DASH,
    };

    const dataSourceSize = getPVCSize(pvc) || getDataVolumeSize(dataVolume);
    const dataVolumeCustomSize = dataVolumeTemplate?.spec?.storage?.resources?.requests?.storage;

    const size = getHumanizedSize(dataVolumeCustomSize || dataSourceSize);

    diskRowDataObject.size = size.value === 0 ? NO_DATA_DASH : size.string;

    const source = pvc || dataVolume;
    if (source) {
      diskRowDataObject.source = getName(source);
      diskRowDataObject.sourceStatus = getPhase(source);
      diskRowDataObject.storageClass =
        getPVCStorageClassName(pvc) || getDataVolumeStorageClassName(dataVolume);
    }

    if (volumeSource === VolumeTypes.CONTAINER_DISK) {
      diskRowDataObject.source = CONTAINER_EPHERMAL;
      diskRowDataObject.size = DYNAMIC;
    }

    return diskRowDataObject;
  });
};
