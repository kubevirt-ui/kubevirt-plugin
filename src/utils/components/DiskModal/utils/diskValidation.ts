import {
  type V1DataVolumeTemplateSpec,
  type V1Disk,
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { getBootDisk, getDataVolumeTemplates, getVolumes } from '@kubevirt-utils/resources/vm';
import { getOperatingSystem } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { SourceTypes } from './types';

export const checkDifferentStorageClassFromBootPVC = (
  vm: V1VirtualMachine,
  selectedStorageClass: string,
): boolean => {
  const bootDiskName = getBootDisk(vm)?.name;
  const bootVolume = getVolumes(vm).find((vol) => vol?.name === bootDiskName);
  const bootDVT = getDataVolumeTemplates(vm)?.find(
    (dvt) => getName(dvt) === bootVolume?.dataVolume?.name,
  );

  const source = Boolean(bootDVT?.spec?.source?.pvc ?? bootDVT?.spec?.sourceRef);
  return source && bootDVT?.spec?.storage?.storageClassName !== selectedStorageClass;
};

export const getRunningVMMissingDisksFromVMI = (
  vmDisks: V1Disk[],
  vmi: V1VirtualMachineInstance,
): V1Disk[] => {
  const vmDiskNames = vmDisks?.map((disk) => disk?.name);
  const missingDisksFromVMI = (vmi?.spec?.domain?.devices?.disks ?? [])?.filter(
    (disk) => !vmDiskNames?.includes(disk?.name),
  );
  return missingDisksFromVMI || [];
};

export const getRunningVMMissingVolumesFromVMI = (
  vmVolumes: V1Volume[],
  vmi: V1VirtualMachineInstance,
): V1Volume[] => {
  const vmVolumeNames = vmVolumes?.map((vol) => vol?.name);
  const missingVolumesFromVMI = (vmi?.spec?.volumes ?? [])?.filter(
    (vol) => !vmVolumeNames?.includes(vol?.name),
  );
  return missingVolumesFromVMI || [];
};

export const doesSourceRequireDataVolume = (diskSource: SourceTypes): boolean => {
  return [
    SourceTypes.BLANK,
    SourceTypes.CDROM,
    SourceTypes.CLONE_PVC,
    SourceTypes.DATA_SOURCE,
    SourceTypes.HTTP,
    SourceTypes.REGISTRY,
    SourceTypes.UPLOAD,
    SourceTypes.VOLUME_SNAPSHOT,
  ].includes(diskSource);
};

export const getSourceFromVolume = (
  volume: V1Volume,
  dataVolumeTemplate: V1DataVolumeTemplateSpec,
): SourceTypes => {
  if (dataVolumeTemplate?.spec?.source?.http) return SourceTypes.HTTP;

  if (dataVolumeTemplate?.spec?.source?.pvc) return SourceTypes.CLONE_PVC;

  if (dataVolumeTemplate?.spec?.source?.registry) return SourceTypes.REGISTRY;

  if (dataVolumeTemplate?.spec?.source?.blank) return SourceTypes.BLANK;

  if (dataVolumeTemplate?.spec?.source?.upload) return SourceTypes.UPLOAD;

  if (dataVolumeTemplate?.spec?.source?.snapshot) return SourceTypes.VOLUME_SNAPSHOT;

  if (dataVolumeTemplate?.spec?.sourceRef) return SourceTypes.DATA_SOURCE;

  if (volume?.persistentVolumeClaim) return SourceTypes.PVC;

  if (volume?.containerDisk) return SourceTypes.EPHEMERAL;

  return SourceTypes.OTHER;
};

export const doesDataVolumeTemplateHaveDisk = (vm: V1VirtualMachine, diskName: string): boolean => {
  const diskVolume = getVolumes(vm)?.find((volume) => volume.name === diskName);
  const dataVolumeTemplate = getDataVolumeTemplates(vm)?.find(
    (dvt) => getName(dvt) === diskVolume?.dataVolume?.name,
  );

  return !isEmpty(dataVolumeTemplate);
};

export const getOS = (vm: V1VirtualMachine): string =>
  getAnnotation(vm?.spec?.template, ANNOTATIONS.os) || getOperatingSystem(vm);

export const getOSNameWithoutVersionNumber = (osName: string): string => {
  const name = osName?.match(/[a-zA-Z]+/g);
  return name?.[0];
};
