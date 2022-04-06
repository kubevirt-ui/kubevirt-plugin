import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const ensurePath = <T extends object>(data: T, paths: string | string[]) => {
  let current = data;

  if (Array.isArray(paths)) {
    paths.forEach((path) => ensurePath(data, path));
  } else {
    const keys = paths.split('.');

    for (const key of keys) {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
  }
};

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
