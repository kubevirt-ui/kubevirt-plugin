import {
  type V1Disk,
  type V1Interface,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { interfaceModelType } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/constants';
import { getDisks, getInterfaces } from '@kubevirt-utils/resources/vm';
import { type PatchCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';

type PatchArgs = Parameters<PatchCustomizeWizardVMSignal>[0];

export const hasNonVirtioDisk = (vm: V1VirtualMachine): boolean =>
  (getDisks(vm) ?? []).some((disk) => disk?.disk?.bus && disk.disk.bus !== InterfaceTypes.VIRTIO);

export const hasNonVirtioInterface = (vm: V1VirtualMachine): boolean =>
  (getInterfaces(vm) ?? []).some(
    (iface) => iface?.model && iface.model !== interfaceModelType.VIRTIO,
  );

export const switchDisksToVirtio = (vm: V1VirtualMachine): PatchArgs => {
  const updatedDisks: V1Disk[] = (getDisks(vm) ?? []).map((disk) =>
    disk?.disk && disk.disk.bus !== InterfaceTypes.VIRTIO
      ? { ...disk, disk: { ...disk.disk, bus: InterfaceTypes.VIRTIO } }
      : disk,
  );

  return [{ data: updatedDisks, path: 'spec.template.spec.domain.devices.disks' }];
};

export const switchInterfacesToVirtio = (vm: V1VirtualMachine): PatchArgs => {
  const updatedInterfaces: V1Interface[] = (getInterfaces(vm) ?? []).map((iface) =>
    iface?.model && iface.model !== interfaceModelType.VIRTIO
      ? { ...iface, model: interfaceModelType.VIRTIO }
      : iface,
  );

  return [{ data: updatedInterfaces, path: 'spec.template.spec.domain.devices.interfaces' }];
};
