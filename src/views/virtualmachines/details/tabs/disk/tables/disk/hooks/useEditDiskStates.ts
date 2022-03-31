import * as React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  DYNAMIC,
  OTHER,
  sourceTypes,
  volumeTypes,
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
  vmi?: V1VirtualMachineInstance,
) => {
  initialDiskState: DiskFormState;
  initialDiskSourceState: DiskSourceState;
};

export const useEditDiskStates: UseEditDiskStates = (vm, diskName, vmi) => {
  const initialDiskSourceState = React.useMemo(() => ({ ...initialStateDiskSource }), []);
  const disks = !vmi ? getDisks(vm) : vmi?.spec?.domain?.devices?.disks;
  const disk = disks?.find(({ name }) => name === diskName);

  const { diskSource, diskSize } = React.useMemo(() => {
    const volumes = !vmi ? getVolumes(vm) : vmi?.spec?.volumes;
    const volume = volumes?.find(({ name }) => name === diskName);
    // volume consists of 2 keys:
    // name and one of: containerDisk/cloudInitNoCloud
    const volumeSource = Object.keys(volume).find((key) =>
      [
        volumeTypes.CONTAINER_DISK,
        volumeTypes.DATA_VOLUME,
        volumeTypes.PERSISTENT_VOLUME_CLAIM,
      ].includes(key),
    );

    if (volumeSource === sourceTypes.EPHEMERAL) {
      initialDiskSourceState.ephemeralSource = volume.containerDisk?.image;
      return { diskSource: sourceTypes.EPHEMERAL, diskSize: DYNAMIC };
    }
    return { diskSource: OTHER, diskSize: null };
  }, [initialDiskSourceState, vm, vmi, diskName]);

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
