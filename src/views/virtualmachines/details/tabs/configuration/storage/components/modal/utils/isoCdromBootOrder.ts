import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDisks, getInterfaces } from '@kubevirt-utils/resources/vm';

const getUsedBootOrders = (vm: V1VirtualMachine): Set<number> => {
  const orders = new Set<number>();
  for (const disk of getDisks(vm) ?? []) {
    if (disk.bootOrder != null) {
      orders.add(disk.bootOrder);
    }
  }
  for (const networkInterface of getInterfaces(vm) ?? []) {
    if (networkInterface.bootOrder != null) {
      orders.add(networkInterface.bootOrder);
    }
  }
  return orders;
};

const nextUnusedBootOrder = (usedOrders: Set<number>, fromOrder: number): number => {
  let nextOrder = fromOrder + 1;
  while (usedOrders.has(nextOrder)) {
    nextOrder += 1;
  }
  return nextOrder;
};

/** Assign preferredOrder to deviceName, shifting colliding disk/interface orders. */
export const assignUniqueBootOrder = (
  draftVM: V1VirtualMachine,
  deviceName: string,
  preferredOrder: number,
): void => {
  const usedOrders = getUsedBootOrders(draftVM);
  const disks = getDisks(draftVM) ?? [];
  const interfaces = getInterfaces(draftVM) ?? [];

  const releaseOrder = (order: number, ownerName: string): void => {
    for (const disk of disks) {
      if (disk.name !== ownerName && disk.bootOrder === order) {
        const nextOrder = nextUnusedBootOrder(usedOrders, order);
        usedOrders.delete(order);
        disk.bootOrder = nextOrder;
        usedOrders.add(nextOrder);
      }
    }
    for (const networkInterface of interfaces) {
      if (networkInterface.name !== ownerName && networkInterface.bootOrder === order) {
        const nextOrder = nextUnusedBootOrder(usedOrders, order);
        usedOrders.delete(order);
        networkInterface.bootOrder = nextOrder;
        usedOrders.add(nextOrder);
      }
    }
  };

  releaseOrder(preferredOrder, deviceName);

  const disk = disks.find((item) => item.name === deviceName);
  if (disk) {
    if (disk.bootOrder != null) {
      usedOrders.delete(disk.bootOrder);
    }
    disk.bootOrder = preferredOrder;
    usedOrders.add(preferredOrder);
  }
};
