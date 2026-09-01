import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';

import { type V1DiskFormState } from './types';
import { produceVMDisks } from './vmProducers';

export const editDisk = (
  data: V1DiskFormState,
  diskName: string,
  vm: V1VirtualMachine,
): V1VirtualMachine => {
  const volumes = getVolumes(vm) ?? [];
  const diskIndex = (getDisks(vm) ?? []).findIndex((disk) => disk.name === diskName);
  const volumeIndex = volumes.findIndex((volume) => volume.name === diskName);
  const dataVolumeTemplateIndex = (getDataVolumeTemplates(vm) ?? []).findIndex(
    (dataVolume) => getName(dataVolume) === volumes[volumeIndex]?.dataVolume?.name,
  );

  return produceVMDisks(vm, (draftVM: V1VirtualMachine): void => {
    draftVM.spec.template.spec.domain.devices.disks.splice(diskIndex, 1, data.disk);
    if (volumeIndex >= 0) {
      draftVM.spec.template.spec.volumes.splice(volumeIndex, 1, data.volume);
    }
    if (dataVolumeTemplateIndex >= 0) {
      draftVM.spec.dataVolumeTemplates.splice(dataVolumeTemplateIndex, 1, data.dataVolumeTemplate);
    }
  });
};

export const addDisk = (data: V1DiskFormState, vm: V1VirtualMachine): V1VirtualMachine => {
  return produceVMDisks(vm, (draftVM: V1VirtualMachine): void => {
    draftVM.spec.template.spec.domain.devices.disks.push(data.disk);
    if (data.volume) {
      draftVM.spec.template.spec.volumes.push(data.volume);
    }
    if (data.dataVolumeTemplate) {
      draftVM.spec.dataVolumeTemplates.push(data.dataVolumeTemplate);
    }
  });
};

export const resizeVMDataVolumeTemplate = (
  data: V1DiskFormState,
  vm: V1VirtualMachine,
): V1VirtualMachine => {
  return produce(vm, (draftVM: V1VirtualMachine): void => {
    if (!draftVM?.spec?.dataVolumeTemplates) {
      return;
    }

    const templateName = data.dataVolumeTemplate?.metadata?.name;
    const vmDataVolumeTemplate = draftVM.spec.dataVolumeTemplates.find(
      (dataVolume) => dataVolume.metadata?.name === templateName,
    );
    if (!vmDataVolumeTemplate) {
      return;
    }
    ensurePath(vmDataVolumeTemplate, ['spec.storage.resources.requests.storage']);
    vmDataVolumeTemplate.spec.storage.resources.requests.storage = data.expandPVCSize;
  });
};
