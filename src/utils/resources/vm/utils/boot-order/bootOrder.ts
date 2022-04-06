import { V1Disk, V1Interface } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getPrintableDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';

/**
 * @date 3/20/2022 - 11:34:56 AM
 *
 * @export
 * @typedef {BootableDeviceType}
 */
export type BootableDeviceType = {
  type: string;
  typeLabel: string;
  value: V1Disk | V1Interface;
};

/**
 * @date 3/20/2022 - 11:34:56 AM
 *
 * @export
 * @enum {number}
 */
export enum DeviceType {
  NIC = 'NIC',
  DISK = 'DISK',
}

/**
 * Transform disk and nics into BootableDeviceType[]
 * @date 3/20/2022 - 11:34:56 AM
 *
 * @param {V1Disk[]} [disks=[]] - disks
 * @param {V1Interface[]} [nics=[]] - nics
 * @returns {BootableDeviceType[]}
 */
export const transformDevices = (
  disks: V1Disk[] = [],
  nics: V1Interface[] = [],
): BootableDeviceType[] => {
  const transformedDisks = disks?.map((disk) => ({
    type: DeviceType.DISK,
    typeLabel: getPrintableDiskDrive(disk),
    value: disk,
  }));
  const transformedNics = nics?.map((nic) => ({
    type: DeviceType.NIC,
    typeLabel: DeviceType.NIC,
    value: nic,
  }));

  return [...transformedDisks, ...transformedNics];
};
