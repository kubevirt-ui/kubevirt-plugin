import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import {
  V1DataVolumeTemplateSpec,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isExpandableSpecVM } from '@kubevirt-utils/resources/instancetype/helper';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import {
  CDROM_DEVICE_NAME,
  DISK_DEVICE_NAME,
} from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { generatePrettyName, isEmpty } from '@kubevirt-utils/utils/utils';

import { DEFAULT_DISK_SIZE } from './constants';
import { createDataVolumeName, doesSourceRequireDataVolume } from './helpers';
import { DefaultFormValues, InterfaceTypes, SourceTypes, V1DiskFormState } from './types';

const getDefaultDataVolumeTemplate = (name: string): V1DataVolumeTemplateSpec => ({
  metadata: { name },
  spec: { source: {}, storage: { resources: { requests: { storage: DEFAULT_DISK_SIZE } } } },
});

const createInitialStateFromSource: Record<
  Exclude<SourceTypes, SourceTypes.OTHER>,
  (volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) => void
> = {
  [SourceTypes.BLANK]: (_volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.blank = {}),
  [SourceTypes.CDROM]: (_volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.blank = {}),
  [SourceTypes.CLONE_PVC]: (_volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.pvc = { name: '', namespace: '' }),
  [SourceTypes.DATA_SOURCE]: (_volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.sourceRef = { kind: DataSourceModel.kind, name: '', namespace: '' }),
  [SourceTypes.EPHEMERAL]: (volume: V1Volume) => (volume.containerDisk = { image: '' }),
  [SourceTypes.HTTP]: (_volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.http = { url: '' }),
  [SourceTypes.PVC]: (volume: V1Volume) => (volume.persistentVolumeClaim = { claimName: '' }),
  [SourceTypes.REGISTRY]: (_volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.registry = { url: '' }),
  [SourceTypes.UPLOAD]: (_volume: V1Volume, dataVolumeTemplate: V1DataVolumeTemplateSpec) =>
    (dataVolumeTemplate.spec.source.upload = {}),
  [SourceTypes.VOLUME_SNAPSHOT]: (
    _volume: V1Volume,
    dataVolumeTemplate: V1DataVolumeTemplateSpec,
  ) => (dataVolumeTemplate.spec.source.snapshot = { name: '', namespace: '' }),
};

export const getDefaultEditValues = (
  vm: V1VirtualMachine,
  editDiskName?: string,
  defaultValues?: DefaultFormValues,
) => {
  const isBootSource = getBootDisk(vm)?.name === editDiskName;
  let diskToEdit = getDisks(vm)?.find((disk) => disk.name === editDiskName);
  const volumeToEdit = getVolumes(vm)?.find((volume) => volume.name === editDiskName);
  const dataVolumeTemplate = getDataVolumeTemplates(vm)?.find(
    (dv) => getName(dv) === volumeToEdit?.dataVolume?.name,
  );

  if (isEmpty(diskToEdit) && isExpandableSpecVM(vm)) diskToEdit = { name: editDiskName };

  return {
    dataVolumeTemplate,
    disk: diskToEdit,
    isBootSource,
    volume: volumeToEdit,
    ...(defaultValues ? defaultValues : {}),
  };
};

export const getDefaultCreateValues = (
  vm: V1VirtualMachine,
  createDiskSource: SourceTypes,
): V1DiskFormState => {
  const namePrefix = createDiskSource === SourceTypes.CDROM ? CDROM_DEVICE_NAME : DISK_DEVICE_NAME;
  const newDiskName = generatePrettyName(namePrefix);
  const newDataVolumeName = createDataVolumeName(vm, newDiskName);

  const withDataVolume = doesSourceRequireDataVolume(createDiskSource);

  const dataVolumeTemplate: V1DataVolumeTemplateSpec = withDataVolume
    ? getDefaultDataVolumeTemplate(newDataVolumeName)
    : null;

  const volume: V1Volume = withDataVolume
    ? { dataVolume: { name: newDataVolumeName }, name: newDiskName }
    : { name: newDiskName };

  createInitialStateFromSource?.[createDiskSource]?.(volume, dataVolumeTemplate);

  const isCDROM = createDiskSource === SourceTypes.CDROM;

  const diskConfig = isCDROM
    ? { cdrom: { bus: InterfaceTypes.SATA } }
    : { disk: { bus: InterfaceTypes.VIRTIO } };

  return {
    dataVolumeTemplate,
    disk: {
      ...diskConfig,
      name: newDiskName,
    },
    isBootSource: false,
    storageProfileSettingsApplied: true,
    volume,
  };
};
