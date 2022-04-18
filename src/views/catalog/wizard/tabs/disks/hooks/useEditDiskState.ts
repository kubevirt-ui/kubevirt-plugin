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
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
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

const getSourceFromDataVolue = (dataVolume: V1DataVolumeTemplateSpec): string => {
  if (dataVolume.spec?.source?.blank) return sourceTypes.BLANK;
  else if (dataVolume.spec?.source?.http) return sourceTypes.HTTP;
  else if (dataVolume.spec?.source?.pvc) return sourceTypes.CLONE_PVC;
  else if (dataVolume.spec?.source?.registry) return sourceTypes.REGISTRY;
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
  }
};

export const useEditDiskStates: UseEditDiskStates = (vm, diskName) => {
  const initialDiskSourceState = React.useMemo(() => ({ ...initialStateDiskSource }), []);
  const disks = getDisks(vm);
  const disk = disks?.find(({ name }) => name === diskName);

  const { diskSource, diskSize } = React.useMemo(() => {
    const dataVolumeTemplates = getDataVolumeTemplates(vm);

    const volumes = getVolumes(vm);
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

    const dataVolumeTemplate = dataVolumeTemplates?.find(
      (dataVolume) => dataVolume.metadata.name === volume.dataVolume?.name,
    );

    if (dataVolumeTemplate && dataVolumeTemplate.spec?.source) {
      setInitialStateFromDataVolume(dataVolumeTemplate, initialDiskSourceState);
      return {
        diskSource: getSourceFromDataVolue(dataVolumeTemplate),
        diskSize:
          dataVolumeTemplate.spec?.storage?.resources?.requests?.storage ||
          dataVolumeTemplate.spec?.pvc?.resources?.requests?.storage,
      };
    }

    return { diskSource: OTHER, diskSize: null };
  }, [initialDiskSourceState, vm, diskName]);

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
