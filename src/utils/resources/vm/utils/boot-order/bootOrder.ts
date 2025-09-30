import { V1Disk, V1Interface, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getDisks, getInterfaces } from '@kubevirt-utils/resources/vm';
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
  DISK = 'DISK',
  NIC = 'NIC',
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

export const sortBootOrder = (a: BootableDeviceType, b: BootableDeviceType) => {
  if (a.value.bootOrder && b.value.bootOrder) {
    return a.value.bootOrder - b.value.bootOrder;
  }

  if (a.value.bootOrder) {
    return -1;
  }

  if (b.value.bootOrder) {
    return 1;
  }

  return 0;
};
export const getBootableSortedDevices = ({
  instanceTypeVM,
  vm,
}: {
  instanceTypeVM: V1VirtualMachine;
  vm: V1VirtualMachine;
}): BootableDeviceType[] | undefined => {
  const disks = getDisks(instanceTypeVM || vm);
  const interfaces = getInterfaces(vm);
  return transformDevices(disks, interfaces)?.toSorted(sortBootOrder);
};
