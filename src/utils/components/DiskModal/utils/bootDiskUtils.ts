import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDisks } from '@kubevirt-utils/resources/vm';

const applyDiskAsBootable = (vm: V1VirtualMachine, diskName: string): V1VirtualMachine => {
  return produce(vm, (draftVM) => {
    const disks = getDisks(draftVM);

    disks.forEach((disk, index) => {
      if (disk.name === diskName) {
        disk.bootOrder = 1;
        return;
      }

      disk.bootOrder = index + 2;
    });
  });
};

const removeDiskAsBootable = (vm: V1VirtualMachine, diskName: string): V1VirtualMachine => {
  return produce(vm, (draftVM) => {
    const disks = getDisks(draftVM);
    const disk = disks.find((d) => d.name === diskName);

    if (disk) delete disk.bootOrder;

    disks
      .filter((d) => d.name !== diskName && d.bootOrder != null)
      .sort((a, b) => (a.bootOrder ?? Infinity) - (b.bootOrder ?? Infinity))
      .forEach((d, index) => {
        d.bootOrder = index + 1;
      });
  });
};

export const reorderBootDisk = (
  vm: V1VirtualMachine,
  diskName: string,
  isBootDisk: boolean,
  initialBootDisk: boolean,
) => {
  if (isBootDisk === initialBootDisk) return vm;

  return isBootDisk ? applyDiskAsBootable(vm, diskName) : removeDiskAsBootable(vm, diskName);
};
