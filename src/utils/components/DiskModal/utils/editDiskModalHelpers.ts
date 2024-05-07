import {
  V1DataVolumeTemplateSpec,
  V1Disk,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

import { mapSourceTypeToVolumeType, OTHER, sourceTypes } from '../DiskFormFields/utils/constants';
import { DiskFormState, DiskSourceState } from '../state/initialState';

import { requiresDataVolume } from './helpers';

export const updateVolume = (
  vm: V1VirtualMachine,
  oldVolume: V1Volume,
  diskState: DiskFormState,
  diskSourceState: DiskSourceState,
): V1Volume => {
  const updatedVolume = { ...oldVolume };
  if (updatedVolume.name !== diskState.diskName) {
    updatedVolume.name = diskState.diskName;
  }
  const oldVolumeSourceKey = Object.keys(oldVolume).find((key) => key !== 'name');
  const oldVolumeSource = mapSourceTypeToVolumeType[oldVolumeSourceKey];
  const newVolumeSource = mapSourceTypeToVolumeType[diskState.diskSource];

  if (newVolumeSource === OTHER) {
    updatedVolume[oldVolumeSourceKey] = oldVolume[oldVolumeSourceKey];
    return updatedVolume;
  }

  if (oldVolumeSource !== newVolumeSource) {
    delete updatedVolume[oldVolumeSource];
  }

  if (diskState.diskSource === sourceTypes.EPHEMERAL) {
    updatedVolume.containerDisk = {
      image: diskSourceState.ephemeralSource,
    };

    return updatedVolume;
  }

  if (diskState.diskSource === sourceTypes.PVC) {
    updatedVolume.persistentVolumeClaim = {
      claimName: diskSourceState.pvcSourceName,
    };

    return updatedVolume;
  }

  if (diskState.diskSource === sourceTypes.UPLOAD) {
    return {
      name: diskState.diskName,
      persistentVolumeClaim: {
        claimName: `${vm?.metadata?.name}-${diskState.diskName}`,
      },
    };
  }

  return updatedVolume;
};

export const updateVMDisks = (
  disks: V1Disk[],
  updatedDisk: V1Disk,
  initialDiskName: string,
  useAsBoot: boolean,
): V1Disk[] => {
  return useAsBoot
    ? [
        { ...updatedDisk, bootOrder: 1 },
        ...(disks || [])
          .filter((disk) => disk.name !== initialDiskName)
          .map((disk, index) => ({
            ...disk,
            // other disks should have bootOrder set to 2+
            bootOrder: 2 + index,
          })),
      ]
    : [...(disks || []).filter((d) => d?.name !== initialDiskName), updatedDisk];
};

export const updateVMVolumes = (
  volumes: V1Volume[],
  updatedVolume: V1Volume,
  initialVolumeName: string,
): V1Volume[] => {
  return [
    ...(volumes?.map((volume) => {
      if (volume?.name === initialVolumeName) {
        return updatedVolume;
      }
      return volume;
    }) || [updatedVolume]),
  ];
};

export const updateVMDataVolumeTemplates = (
  dataVolumeTemplates: V1DataVolumeTemplateSpec[],
  updatedDataVolumeTemplate: V1DataVolumeTemplateSpec,
  initialDiskSource: string,
  sourceRequiresDataVolume: boolean,
  updatedVmVolumes: V1Volume[],
): V1DataVolumeTemplateSpec[] => {
  const updatedDataVolumeTemplates = () => {
    if (sourceRequiresDataVolume) {
      if (requiresDataVolume(initialDiskSource)) {
        return [
          ...(dataVolumeTemplates || []).filter(
            (dvt) => dvt?.metadata?.name !== updatedDataVolumeTemplate?.metadata?.name,
          ),
          updatedDataVolumeTemplate,
        ];
      } else {
        return [...(dataVolumeTemplates || []), updatedDataVolumeTemplate];
      }
    }
    return dataVolumeTemplates || [];
  };

  return updatedDataVolumeTemplates().filter((dvt) =>
    updatedVmVolumes.some((volume) => volume?.dataVolume?.name === dvt.metadata.name),
  );
};
