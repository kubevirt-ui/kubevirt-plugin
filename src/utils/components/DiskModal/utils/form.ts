import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import {
  V1DataVolumeTemplateSpec,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { isInstanceTypeVM } from '@kubevirt-utils/resources/vm/utils/instanceTypes';
import { generatePrettyName, isEmpty } from '@kubevirt-utils/utils/utils';
import { isRunning } from '@virtualmachines/utils';

import { DEFAULT_DISK_SIZE } from './constants';
import { doesSourceRequireDataVolume, getDefaultDiskType } from './helpers';
import { SourceTypes, V1DiskFormState } from './types';

const getDefaultDataVolumeTemplate = (name: string): V1DataVolumeTemplateSpec => ({
  metadata: { name },
  spec: { source: {}, storage: { resources: { requests: { storage: DEFAULT_DISK_SIZE } } } },
});

const createInitialStateFromSource: Record<
  Exclude<SourceTypes, SourceTypes.OTHER>,
  (volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) => void
> = {
  [SourceTypes.BLANK]: (volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.blank = {}),
  [SourceTypes.CLONE_PVC]: (volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.pvc = { name: '', namespace: '' }),
  [SourceTypes.DATA_SOURCE]: (volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.sourceRef = { kind: DataSourceModel.kind, name: '', namespace: '' }),
  [SourceTypes.EPHEMERAL]: (volume: V1Volume) => (volume.containerDisk = { image: '' }),
  [SourceTypes.HTTP]: (volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.http = { url: '' }),
  [SourceTypes.PVC]: (volume: V1Volume) => (volume.persistentVolumeClaim = { claimName: '' }),
  [SourceTypes.REGISTRY]: (volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.registry = { url: '' }),
  [SourceTypes.UPLOAD]: (volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.upload = {}),
  [SourceTypes.VOLUME_SNAPSHOT]: (volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.snapshot = { name: '', namespace: '' }),
};

export const getDefaultEditValues = (vm: V1VirtualMachine, editDiskName?: string) => {
  const isBootSource = getBootDisk(vm)?.name === editDiskName;
  let diskToEdit = getDisks(vm)?.find((disk) => disk.name === editDiskName);
  const volumeToEdit = getVolumes(vm)?.find((volume) => volume.name === editDiskName);
  const dataVolumeTemplate = getDataVolumeTemplates(vm)?.find(
    (dv) => getName(dv) === volumeToEdit?.dataVolume?.name,
  );

  if (isEmpty(diskToEdit) && isInstanceTypeVM(vm)) diskToEdit = { name: editDiskName };

  return {
    dataVolumeTemplate,
    disk: diskToEdit,
    isBootSource,
    volume: volumeToEdit,
  };
};

export const getDefaultCreateValues = (
  vm: V1VirtualMachine,
  createDiskSource: SourceTypes,
): V1DiskFormState => {
  const newDiskName = generatePrettyName('disk');
  const newDataVolumeName = generatePrettyName(`dv-${getName(vm)}`);

  const withDataVolume = doesSourceRequireDataVolume(createDiskSource);

  const dataVolumeTemplate: V1DataVolumeTemplateSpec = withDataVolume
    ? getDefaultDataVolumeTemplate(newDataVolumeName)
    : null;

  const volume: V1Volume = withDataVolume
    ? { dataVolume: { name: newDataVolumeName }, name: newDiskName }
    : { name: newDiskName };

  createInitialStateFromSource?.[createDiskSource]?.(volume, dataVolumeTemplate);

  return {
    dataVolumeTemplate,
    disk: {
      disk: { bus: getDefaultDiskType(isRunning(vm)) },
      name: newDiskName,
    },
    isBootSource: false,
    volume,
  };
};
