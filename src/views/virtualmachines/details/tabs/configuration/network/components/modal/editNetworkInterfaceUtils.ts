import produce from 'immer';

import {
  type V1Interface,
  type V1Network,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { prepareNICBootOrder } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import { getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';

const BINDING_KEYS: (keyof V1Interface)[] = [
  'bridge',
  'masquerade',
  'sriov',
  'binding',
  'passtBinding',
];

export const mergeInterfaces = (
  existingInterface: V1Interface,
  resultInterface: V1Interface,
  isBootSource: boolean,
): V1Interface => {
  const merged: V1Interface = { ...existingInterface, ...resultInterface };
  for (const key of BINDING_KEYS) if (!resultInterface[key]) delete merged[key];
  if (!isBootSource) delete merged.bootOrder;
  return merged;
};

export const produceUpdatedVM = (
  vm: V1VirtualMachine,
  isBootSource: boolean,
  resultInterface: V1Interface,
  resultNetwork: V1Network,
  existingInterface: V1Interface,
  existingNetwork: V1Network,
  nicName: string,
): V1VirtualMachine => {
  const { disksWithOrder, needsDiskUpdate, nicBootOrder } = prepareNICBootOrder(vm);
  if (isBootSource) resultInterface.bootOrder = nicBootOrder;

  return produce(vm, (draftVM) => {
    if (isBootSource && needsDiskUpdate) {
      const devices = draftVM.spec?.template?.spec?.domain?.devices;
      if (devices) {
        devices.disks = disksWithOrder;
      }
    }
    const ifaces = getInterfaces(draftVM) ?? [];
    const networks = getNetworks(draftVM) ?? [];
    const ifaceIndex = ifaces.findIndex((iface) => iface.name === nicName);
    const netIndex = networks.findIndex((net) => net.name === nicName);
    if (ifaceIndex >= 0) {
      ifaces[ifaceIndex] = mergeInterfaces(existingInterface, resultInterface, isBootSource);
    }
    if (netIndex >= 0) networks[netIndex] = { ...existingNetwork, ...resultNetwork };
  });
};
