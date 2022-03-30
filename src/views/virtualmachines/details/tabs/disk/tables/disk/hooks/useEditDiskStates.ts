import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  DYNAMIC,
  OTHER,
  sourceTypes,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/constants';
import {
  DiskFormState,
  DiskSourceState,
  initialStateDiskSource,
} from '@kubevirt-utils/components/DiskModal/state/initialState';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive, getDiskInterface } from '@kubevirt-utils/resources/vm/utils/disk/selectors';

type UseEditDiskStates = (
  vm: V1VirtualMachine,
  diskName: string,
) => {
  initialDiskState: DiskFormState;
  initialDiskSourceState: DiskSourceState;
};

export const useEditDiskStates: UseEditDiskStates = (vm: V1VirtualMachine, diskName: string) => {
  const initialDiskSourceState = React.useMemo(() => ({ ...initialStateDiskSource }), []);

  const { diskSource, diskSize } = React.useMemo(() => {
    const volume = getVolumes(vm)?.find(({ name }) => name === diskName);
    // volume consists of 2 keys:
    // name and one of: containerDisk/cloudInitNoCloud
    const volumeSource = Object.keys(volume).filter((key) => key !== 'name')?.[0];

    if (volumeSource === sourceTypes.EPHEMERAL) {
      initialDiskSourceState.ephemeralSource = volume.containerDisk?.image;
      return { diskSource: sourceTypes.EPHEMERAL, diskSize: DYNAMIC };
    }
    return { diskSource: OTHER, diskSize: null };
  }, [initialDiskSourceState, vm, diskName]);

  const disk = getDisks(vm)?.find(({ name }) => name === diskName);

  const initialDiskState: DiskFormState = {
    diskName,
    diskSize,
    diskType: diskTypes[getDiskDrive(disk)],
    diskSource,
    detachHotplug: false,
    enablePreallocation: false,
    storageClass: null,
    volumeMode: null,
    accessMode: null,
    diskInterface: getDiskInterface(disk),
    applyStorageProfileSettings: false,
    storageClassProvisioner: null,
    storageProfileSettingsCheckboxDisabled: false,
  };

  return { initialDiskState, initialDiskSourceState };
};
