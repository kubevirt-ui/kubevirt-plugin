import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInitialStateDiskForm } from '@kubevirt-utils/components/DiskModal/utils/constants';
import {
  getRunningVMMissingDisksFromVMI,
  getRunningVMMissingVolumesFromVMI,
  getVolumeSource,
  setEditStateFromDisk,
  setEphemeralURL,
  setOtherSource,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { DiskFormState, SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { getBootDisk, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

type UseEditDiskStates = (
  vm: V1VirtualMachine,
  diskName: string,
  vmi?: V1VirtualMachineInstance,
) => DiskFormState;

export const getEditDiskStates: UseEditDiskStates = (vm, diskName, vmi) => {
  const state = produce(getInitialStateDiskForm(), (draftState) => {
    draftState.isBootSource = getBootDisk(vm)?.name === diskName;

    const disks = !vmi
      ? getDisks(vm)
      : [...(getDisks(vm) || []), ...getRunningVMMissingDisksFromVMI(getDisks(vm) || [], vmi)];
    const disk = disks?.find(({ name }) => name === diskName);

    if (!isEmpty(disk)) {
      setEditStateFromDisk(disk, draftState);
    }

    const volumes = !vmi
      ? getVolumes(vm)
      : [
          ...(getVolumes(vm) || []),
          ...getRunningVMMissingVolumesFromVMI(getVolumes(vm) || [], vmi),
        ];
    const volume = volumes?.find(({ name }) => name === diskName);
    const volumeSource = getVolumeSource(volume);

    if (volumeSource === SourceTypes.EPHEMERAL) {
      setEphemeralURL(volume, draftState);
    }

    setOtherSource(draftState);
  });

  return { ...state, diskName };
};
