import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  CONTAINER_EPHERMAL,
  OTHER,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/constants';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';

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

export const isPVCSource = (obj: DiskRowDataLayout): boolean =>
  ![CONTAINER_EPHERMAL, OTHER].includes(obj?.source);

export const isPVCStatusBound = (obj: DiskRowDataLayout): boolean => obj?.sourceStatus === 'Bound';
