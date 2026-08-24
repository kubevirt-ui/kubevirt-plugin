import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getRunningVMMissingVolumesFromVMI } from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import {
  hasContainerDisk,
  hasDataVolume,
  hasPersistentVolumeClaim,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { isEmptyContainerDiskImage } from '@kubevirt-utils/resources/vm/utils/disk/utils';

const isMountedVolume = (targetVolume: undefined | V1Volume): boolean => {
  if (!targetVolume) return false;
  if (hasContainerDisk(targetVolume)) {
    return !isEmptyContainerDiskImage(targetVolume);
  }
  return hasDataVolume(targetVolume) || hasPersistentVolumeClaim(targetVolume);
};

type DiskVolumeState = {
  isCDROMMountedState: boolean;
  volume: undefined | V1Volume;
};

export const getDiskVolumeState = (
  vm: V1VirtualMachine,
  vmi: undefined | V1VirtualMachineInstance,
  diskName: string,
  isVMRunning: boolean,
  isCDROM: boolean,
): DiskVolumeState => {
  const vmVolumes = getVolumes(vm);

  const vols =
    isVMRunning && !isCDROM
      ? [...(vmVolumes ?? []), ...getRunningVMMissingVolumesFromVMI(vmVolumes ?? [], vmi)]
      : vmVolumes;

  const volume = vols?.find(({ name }) => name === diskName);
  const mounted = isMountedVolume(volume);

  return {
    isCDROMMountedState: isCDROM && mounted,
    volume,
  };
};
