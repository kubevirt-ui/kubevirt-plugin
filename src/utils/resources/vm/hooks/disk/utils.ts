import {
  V1beta1DataVolumeSourcePVC,
  V1Disk,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  DataVolumeModelGroupVersionKind,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { DiskRawData } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';

import { getDataVolumeTemplates, getVolumes } from '../../utils';

const PersistentVolumeClaimGroupVersionKind = modelToGroupVersionKind(PersistentVolumeClaimModel);

export const getPVCAndDVWatches = (vm: V1VirtualMachine) => {
  const cluster = getCluster(vm);

  const pvcSources = getDataVolumeTemplates(vm)?.map((dataVolume) => ({
    name: getName(dataVolume),
    namespace: getNamespace(vm),
  }));

  pvcSources.push(
    ...(getVolumes(vm) || [])
      .map((volume) => volume?.persistentVolumeClaim?.claimName || volume?.dataVolume?.name)
      .filter((claimName) => Boolean(claimName))
      .map(
        (claimName) =>
          ({ name: claimName, namespace: getNamespace(vm) } as V1beta1DataVolumeSourcePVC),
      ),
  );

  const pvcWatches = pvcSources
    .filter((pvcSource) => !isEmpty(pvcSource))
    .reduce((acc, pvcSource) => {
      acc[`${pvcSource.name}-${pvcSource.namespace}`] = {
        cluster,
        groupVersionKind: PersistentVolumeClaimGroupVersionKind,
        name: pvcSource.name,
        namespace: pvcSource.namespace,
      };

      return acc;
    }, {});

  const dvWatches = pvcSources
    .filter((pvcSource) => !isEmpty(pvcSource))
    .reduce((acc, pvcSource) => {
      acc[`${pvcSource.name}-${pvcSource.namespace}`] = {
        cluster,
        groupVersionKind: DataVolumeModelGroupVersionKind,
        name: pvcSource.name,
        namespace: pvcSource.namespace,
      };

      return acc;
    }, {});

  return { dvWatches, pvcWatches };
};

export const getEjectedCDROMDrives = (diskDevices: DiskRawData[], vmDisks: V1Disk[]) => {
  const diskDevicesSet = new Set(diskDevices.map((obj) => obj.disk?.name).filter(Boolean));
  const ejectedCDROMDrives = (vmDisks || []).filter((obj) => !diskDevicesSet.has(obj.name));
  const mappedEjectedCDROMDrives = ejectedCDROMDrives.map((disk) => ({
    disk,
    volume: disk,
  }));
  return mappedEjectedCDROMDrives;
};

export const isStorageVolume = (volume: V1Volume) => {
  return Boolean(
    volume.dataVolume ||
      volume.persistentVolumeClaim ||
      volume.containerDisk ||
      volume.emptyDisk ||
      volume.cloudInitNoCloud ||
      volume.cloudInitConfigDrive,
  );
};
