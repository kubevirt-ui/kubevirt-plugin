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
import { isEmpty } from '@kubevirt-utils/utils/utils';

type DiskVolumeState = {
  isCDROMMountedState: boolean;
  volume: undefined | V1Volume;
};

const getVMVolumesWithRunningVMIVolumes = (
  vmVolumes: V1Volume[],
  vmi: undefined | V1VirtualMachineInstance,
): V1Volume[] => {
  if (isEmpty(vmi)) {
    return vmVolumes;
  }

  const missingVolumes: V1Volume[] = getRunningVMMissingVolumesFromVMI(vmVolumes, vmi);
  return [...vmVolumes, ...missingVolumes];
};

const isMountedVolume = (targetVolume: undefined | V1Volume): boolean => {
  if (!targetVolume) return false;
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
): DiskVolumeState => {
  const vmVolumes: V1Volume[] = getVolumes(vm) ?? [];
  const volumes = isCDROM ? vmVolumes : getVMVolumesWithRunningVMIVolumes(vmVolumes, vmi);

  const volume = volumes.find((vol) => vol.name === diskName);
  const mounted = isMountedVolume(volume);

  return {
    isCDROMMountedState: isCDROM && mounted,
    volume,
  };
};
