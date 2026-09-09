// Extracted from DiskRowActions.tsx
// Root: src/views/virtualmachines/details/tabs/configuration/storage/components/tables/disk/DiskRowActions.tsx

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { produceVMDisks } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { getName } from '@kubevirt-utils/resources/shared';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import {
  hasContainerDisk,
  hasDataVolume,
  hasPersistentVolumeClaim,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { isEmptyContainerDiskImage } from '@kubevirt-utils/resources/vm/utils/disk/utils';
import { getVMIVolumes } from '@kubevirt-utils/resources/vmi';

export const isMountedVolume = (targetVolume: undefined | V1Volume): boolean => {
  if (!targetVolume) {
    return false;
  }
  if (hasContainerDisk(targetVolume)) {
    return !isEmptyContainerDiskImage(targetVolume);
  }
  return hasDataVolume(targetVolume) || hasPersistentVolumeClaim(targetVolume);
};

export const getDiskVolumeState = (
  vm: V1VirtualMachine,
  vmi: undefined | V1VirtualMachineInstance,
  diskName: string,
  isCDROM: boolean,
  isVMRunning: boolean,
): { isCDROMMountedState: boolean; volume: undefined | V1Volume } => {
  const volumes = isVMRunning && !isCDROM ? getVMIVolumes(vmi) : getVolumes(vm);
  const volume = volumes?.find(({ name }) => name === diskName);
  return { isCDROMMountedState: isCDROM && isMountedVolume(volume), volume };
};

export const produceDeletedDiskVM = (vm: V1VirtualMachine, diskName: string): V1VirtualMachine =>
  produceVMDisks(vm, (draftVM) => {
    const volumeToDelete = getVolumes(vm).find((vol) => vol.name === diskName);
    const nameToDelete = volumeToDelete?.name ?? diskName;
    draftVM.spec.template.spec.domain.devices.disks = getDisks(draftVM)?.filter(
      (disk) => disk.name !== nameToDelete,
    );
    draftVM.spec.template.spec.volumes = getVolumes(draftVM)?.filter(
      (vol) => vol.name !== nameToDelete,
    );
    draftVM.spec.dataVolumeTemplates = getDataVolumeTemplates(draftVM)?.filter(
      (dataVolume) => getName(dataVolume) !== volumeToDelete?.dataVolume?.name,
    );
  });
