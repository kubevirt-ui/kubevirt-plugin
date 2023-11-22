import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { sysprepDisk, sysprepVolume } from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { ensurePath } from '@kubevirt-utils/utils/utils';

export const produceVMNetworks = (
  vm: V1VirtualMachine,
  updateNetwork: (vmDraft: WritableDraft<V1VirtualMachine>) => void,
) => {
  return produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices']);

    if (!draftVM.spec.template.spec.domain.devices.interfaces)
      draftVM.spec.template.spec.domain.devices.interfaces = [];

    if (!draftVM.spec.template.spec.networks) draftVM.spec.template.spec.networks = [];

    updateNetwork(draftVM);
  });
};

export const produceVMDisks = (
  vm: V1VirtualMachine,
  updateDisks: (vmDraft: WritableDraft<V1VirtualMachine>) => void,
) => {
  return produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices']);

    if (!draftVM.spec.template.spec.domain.devices.disks)
      draftVM.spec.template.spec.domain.devices.disks = [];

    if (!draftVM.spec.template.spec.volumes) draftVM.spec.template.spec.volumes = [];

    if (!draftVM.spec.dataVolumeTemplates) draftVM.spec.dataVolumeTemplates = [];

    updateDisks(draftVM);
  });
};

export const produceVMDevices = (
  vm: V1VirtualMachine,
  updateDevices: (vmDraft: WritableDraft<V1VirtualMachine>) => void,
) => {
  return produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices']);

    if (!draftVM.spec.template.spec.domain.devices.gpus)
      draftVM.spec.template.spec.domain.devices.gpus = [];

    if (!draftVM.spec.template.spec.domain.devices.hostDevices)
      draftVM.spec.template.spec.domain.devices.hostDevices = [];

    updateDevices(draftVM);
  });
};

export const produceVMSysprep = (vm: V1VirtualMachine, sysprepName?: string) => {
  return produceVMDisks(vm, (vmDraft) => {
    if (
      !vmDraft.spec.template.spec.domain.devices.disks?.find(
        (disk) => disk.name === sysprepDisk.name,
      )
    ) {
      vmDraft.spec.template.spec.domain.devices.disks.push(sysprepDisk());
      vmDraft.spec.template.spec.volumes.push(
        sysprepVolume(sysprepName || `sysprep-config-${vm?.metadata?.name}`),
      );
    }
  });
};
