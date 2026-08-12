import produce from 'immer';
import { type Draft } from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ensurePath } from '@kubevirt-utils/utils/utils';

export const produceVMDisks = (
  vm: V1VirtualMachine,
  updateDraftDisks: (vmDraft: Draft<V1VirtualMachine>) => void,
): V1VirtualMachine => {
  return produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices']);

    draftVM.spec.template.spec.domain.devices.disks ??= [];

    draftVM.spec.template.spec.volumes ??= [];

    draftVM.spec.dataVolumeTemplates ??= [];

    updateDraftDisks(draftVM);
  });
};

export const produceVMNetworks = (
  vm: V1VirtualMachine,
  updateNetworks: (vmDraft: Draft<V1VirtualMachine>) => void,
): V1VirtualMachine => {
  return produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices']);
    draftVM.spec.template.spec.networks ??= [];
    draftVM.spec.template.spec.domain.devices.interfaces ??= [];
    updateNetworks(draftVM);
  });
};

export const produceVMDevices = (
  vm: V1VirtualMachine,
  updateDevices: (vmDraft: Draft<V1VirtualMachine>) => void,
): V1VirtualMachine => {
  return produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices']);
    draftVM.spec.template.spec.domain.devices.gpus ??= [];
    draftVM.spec.template.spec.domain.devices.hostDevices ??= [];
    updateDevices(draftVM);
  });
};
