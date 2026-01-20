import produce from 'immer';
import { Draft } from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  generateSysprepConfigMapName,
  sysprepDisk,
  sysprepVolume,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { ensurePath } from '@kubevirt-utils/utils/utils';

export const produceVMNetworks = (
  vm: V1VirtualMachine,
  updateNetwork: (vmDraft: Draft<V1VirtualMachine>) => void,
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
  updateDisks: (vmDraft: Draft<V1VirtualMachine>) => void,
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
  updateDevices: (vmDraft: Draft<V1VirtualMachine>) => void,
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
    const sysprepDiskToAdd = sysprepDisk();

    if (
      !vmDraft.spec.template.spec.domain.devices.disks?.find(
        (disk) => disk.name === sysprepDiskToAdd.name,
      )
    ) {
      vmDraft.spec.template.spec.domain.devices.disks.push(sysprepDiskToAdd);
      vmDraft.spec.template.spec.volumes.push(
        sysprepVolume(sysprepName || generateSysprepConfigMapName()),
      );
    }
  });
};
