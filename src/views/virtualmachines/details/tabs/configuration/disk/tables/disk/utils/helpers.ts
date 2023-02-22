import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVolumes } from '@kubevirt-utils/resources/vm';

export const isHotplugVolume = (
  vm: V1VirtualMachine,
  diskName: string,
  vmi?: V1VirtualMachineInstance,
): boolean => {
  const volumeStatus = vmi?.status?.volumeStatus?.find((volStatus) => volStatus.name === diskName);
  const vmVolume = getVolumes(vm)?.find((vol) => vol?.name === diskName);
  const hotplugStatus =
    volumeStatus?.hotplugVolume ||
    vmVolume?.dataVolume?.hotpluggable ||
    vmVolume?.persistentVolumeClaim?.hotpluggable;
  return !!hotplugStatus;
};
