import * as React from 'react';

import {
  V1DataVolumeTemplateSpec,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
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
import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
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

const getSourceFromDataVolume = (dataVolume: V1DataVolumeTemplateSpec): string => {
  if (dataVolume.spec?.sourceRef) return sourceTypes.DATA_SOURCE;
  else if (dataVolume.spec?.source?.http) return sourceTypes.HTTP;
  else if (dataVolume.spec?.source?.pvc) return sourceTypes.CLONE_PVC;
  else if (dataVolume.spec?.source?.registry) return sourceTypes.REGISTRY;
  else if (dataVolume.spec?.source?.blank) return sourceTypes.BLANK;
  else return OTHER;
};

const setInitialStateFromDataVolume = (
  dataVolume: V1DataVolumeTemplateSpec,
  initialDiskSourceState: DiskSourceState,
) => {
  if (dataVolume.spec?.source?.http) {
    initialDiskSourceState.urlSource = dataVolume.spec.source.http.url;
  } else if (dataVolume.spec?.source?.pvc) {
    initialDiskSourceState.pvcCloneSourceName = dataVolume.spec.source.pvc.name;
    initialDiskSourceState.pvcCloneSourceNamespace = dataVolume.spec.source.pvc.namespace;
  } else if (dataVolume.spec?.source?.registry) {
    initialDiskSourceState.registrySource = dataVolume.spec.source.registry.url;
  } else if (dataVolume.spec?.sourceRef) {
    initialDiskSourceState.dataSourceName = dataVolume.spec?.sourceRef?.name;
    initialDiskSourceState.dataSourceNamespace = dataVolume.spec?.sourceRef?.namespace;
  }
};

export const useEditDiskStates: UseEditDiskStates = (vm, diskName) => {
  const initialDiskSourceState = React.useMemo(() => ({ ...initialStateDiskSource }), []);
  const disk = getDisks(vm)?.find(({ name }) => name === diskName);

  const {
    diskSource,
    diskSize,
    isBootDisk: asBootSource,
    accessMode,
    volumeMode,
    applyStorageProfileSettings,
  } = React.useMemo(() => {
    const dataVolumeTemplates = getDataVolumeTemplates(vm);

    const volumes = getVolumes(vm);
    const volume = volumes?.find(({ name }) => name === diskName);
    // volume consists of 2 keys:
    // name and one of: containerDisk/cloudInitNoCloud
    const volumeSource =
      volume &&
      Object.keys(volume)?.find((key) =>
        [
          volumeTypes.CONTAINER_DISK,
          volumeTypes.DATA_VOLUME,
          volumeTypes.PERSISTENT_VOLUME_CLAIM,
        ].includes(key),
      );

    const isBootDisk = getBootDisk(vm)?.name === diskName;

    if (volumeSource === sourceTypes.EPHEMERAL) {
      initialDiskSourceState.ephemeralSource = volume.containerDisk?.image;
      return { diskSource: sourceTypes.EPHEMERAL, diskSize: DYNAMIC, isBootDisk };
    }

    if (volumeSource === volumeTypes.PERSISTENT_VOLUME_CLAIM) {
      initialDiskSourceState.pvcSourceName = volume.persistentVolumeClaim?.claimName;
      return {
        diskSource: sourceTypes.PVC,
        isBootDisk,
      };
    }

    const dataVolumeTemplate = dataVolumeTemplates?.find(
      (dataVolume) => dataVolume.metadata.name === volume.dataVolume?.name,
    );

    if (
      dataVolumeTemplate &&
      (dataVolumeTemplate.spec?.source || dataVolumeTemplate.spec?.sourceRef)
    ) {
      setInitialStateFromDataVolume(dataVolumeTemplate, initialDiskSourceState);
      const applySPSettings =
        !dataVolumeTemplate?.spec?.storage?.accessModes &&
        !dataVolumeTemplate?.spec?.storage?.volumeMode;
      return {
        isBootDisk,
        diskSource: getSourceFromDataVolume(dataVolumeTemplate),
        diskSize:
          dataVolumeTemplate.spec?.storage?.resources?.requests?.storage ||
          dataVolumeTemplate.spec?.pvc?.resources?.requests?.storage ||
          '',
        accessMode: !applySPSettings ? dataVolumeTemplate?.spec?.storage?.accessModes?.[0] : null,
        volumeMode: !applySPSettings ? dataVolumeTemplate?.spec?.storage?.volumeMode : null,
        applyStorageProfileSettings: applySPSettings,
      };
    }

    return { diskSource: OTHER, diskSize: null, isBootDisk };
  }, [initialDiskSourceState, vm, diskName]);

  const initialDiskState: DiskFormState = {
    diskName,
    diskSize,
    diskType: diskTypes[getDiskDrive(disk)],
    diskSource,
    enablePreallocation: false,
    storageClass: null,
    volumeMode,
    accessMode,
    diskInterface: getDiskInterface(disk),
    applyStorageProfileSettings: applyStorageProfileSettings ?? true,
    storageClassProvisioner: null,
    storageProfileSettingsCheckboxDisabled: false,
    asBootSource,
  };

  return { initialDiskState, initialDiskSourceState };
};
