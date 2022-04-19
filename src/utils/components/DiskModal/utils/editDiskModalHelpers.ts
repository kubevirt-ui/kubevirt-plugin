import { V1DataVolumeTemplateSpec, V1Disk, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { mapSourceTypeToVolumeType, sourceTypes } from '../DiskFormFields/utils/constants';
import { DiskFormState, DiskSourceState } from '../state/initialState';

import { requiresDataVolume } from './helpers';

export const updateVolume = (
  oldVolume: V1Volume,
  diskState: DiskFormState,
  diskSourceState: DiskSourceState,
  dvName: string,
): V1Volume => {
  const updatedVolume = { ...oldVolume };
  if (updatedVolume.name !== diskState.diskName) {
    updatedVolume.name = diskState.diskName;
  }
  const oldVolumeSourceKey = Object.keys(oldVolume).find((key) => key !== 'name');
  const oldVolumeSource = mapSourceTypeToVolumeType[oldVolumeSourceKey];
  const newVolumeSource = mapSourceTypeToVolumeType[diskState.diskSource];
  if (oldVolumeSource !== newVolumeSource) {
    delete updatedVolume[oldVolumeSource];
  }

  if (requiresDataVolume(diskState.diskSource)) {
    updatedVolume.dataVolume = {
      name: dvName,
    };
  } else if (diskState.diskSource === sourceTypes.EPHEMERAL) {
    updatedVolume.containerDisk = {
      image: diskSourceState.ephemeralSource,
    };
  } else if (diskState.diskSource === sourceTypes.PVC) {
    updatedVolume.persistentVolumeClaim = {
      claimName: diskSourceState.pvcSourceName,
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
): V1DataVolumeTemplateSpec[] => {
  if (sourceRequiresDataVolume) {
    if (requiresDataVolume(initialDiskSource)) {
      return [
        ...dataVolumeTemplates?.map((dataVolumeTemplate) => {
          if (dataVolumeTemplate?.metadata?.name === updatedDataVolumeTemplate?.metadata?.name) {
            return updatedDataVolumeTemplate;
          }
          return dataVolumeTemplate;
        }),
      ];
    } else {
      return dataVolumeTemplates?.length > 0
        ? [...dataVolumeTemplates, updatedDataVolumeTemplate]
        : [updatedDataVolumeTemplate];
    }
  }
  return dataVolumeTemplates;
};
