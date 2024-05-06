import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  DYNAMIC,
  interfaceTypes,
  OTHER,
  sourceTypes,
  volumeTypes,
} from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/constants';
import {
  DiskFormState,
  DiskSourceState,
  initialStateDiskSource,
} from '@kubevirt-utils/components/DiskModal/state/initialState';
import {
  getRunningVMMissingDisksFromVMI,
  getRunningVMMissingVolumesFromVMI,
} from '@kubevirt-utils/components/DiskModal/utils/helpers';
import { getBootDisk, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive, getDiskInterface } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';

type UseEditDiskStates = (
  vm: V1VirtualMachine,
  diskName: string,
  vmi?: V1VirtualMachineInstance,
) => {
  initialDiskSourceState: DiskSourceState;
  initialDiskState: DiskFormState;
};

export const getEditDiskStates: UseEditDiskStates = (vm, diskName, vmi) => {
  const initialDiskSourceState: DiskSourceState = { ...initialStateDiskSource };
  const disks = !vmi
    ? getDisks(vm)
    : [...(getDisks(vm) || []), ...getRunningVMMissingDisksFromVMI(getDisks(vm) || [], vmi)];
  const disk = disks?.find(({ name }) => name === diskName);

  const getDiskDetails = () => {
    const volumes = !vmi
      ? getVolumes(vm)
      : [
          ...(getVolumes(vm) || []),
          ...getRunningVMMissingVolumesFromVMI(getVolumes(vm) || [], vmi),
        ];
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

    const isBootDisk = diskName === getBootDisk(vm)?.name;

    if (volumeSource === sourceTypes.EPHEMERAL) {
      initialDiskSourceState.ephemeralSource = volume.containerDisk?.image;
      return { diskSize: DYNAMIC, diskSource: sourceTypes.EPHEMERAL, isBootDisk };
    }
    return { diskSize: null, diskSource: OTHER, isBootDisk };
  };

  const { diskSize, diskSource, isBootDisk: asBootSource } = getDiskDetails();

  const initialDiskState: DiskFormState = {
    accessMode: null,
    applyStorageProfileSettings: true,
    asBootSource,
    diskInterface: isEmpty(disk) ? interfaceTypes.VIRTIO : getDiskInterface(disk),
    diskName,
    diskSize,
    diskSource,
    diskType: isEmpty(disk) ? diskTypes.disk : diskTypes[getDiskDrive(disk)],
    enablePreallocation: false,
    storageClass: null,
    storageClassProvisioner: null,
    storageProfileSettingsCheckboxDisabled: false,
    volumeMode: null,
  };

  return { initialDiskSourceState, initialDiskState };
};
