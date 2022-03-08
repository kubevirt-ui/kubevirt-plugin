import { V1Disk, V1Interface } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { getPrintableDiskDrive } from '../../disk/utils/VirtualMachineDisksTabUtils';

export type BootableDeviceType = {
  type: string;
  typeLabel: string;
  value: V1Disk | V1Interface;
};

export enum DeviceType {
  NIC = 'NIC',
  DISK = 'DISK',
}

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
